'use strict';
// const Dashboard = require('../models/dashboard.model'); 
// const bcrypt = require('bcrypt');
const CrawlerModel = require('../models/crawler.model');
const Crawler = require('../helpers/crawler.helpers');

exports.crawlerHomePage = async function (req, res) {
  
  var masterLinksRes;
  var startUrl = req.session.customer.site_url;
   
  const masterLinks = await Crawler.crawlSinglePage(startUrl);

  if (masterLinks.size > 0) {
    masterLinksRes = Array.from(masterLinks);
  }

  res.render('crawler/home-page',{ allPages: Array.from(masterLinks),pageTitle:'Crawled Home Page' });
};

exports.crawlerAllPages = async function (req, res) {
  var customer_id = req.session.customer.id;
  //var masterLinksRes; 

  const crawler_links = await new Promise((resolve, reject) => {
    var params = "customer_id='"+customer_id+"' ORDER BY id DESC";
    CrawlerModel.find(params, (err, data) => {
      if (err) { 
        reject(err);  
      } else {
        resolve(data);  
      }
    });
  }); 

  res.render('crawler/all-page',{ allPages: crawler_links,pageTitle:'Crawled All Pages' });
};


exports.crawlerKeywords = async function (req, res) {
  
   
  res.render('crawler/keywords-checker');
};
 
exports.keywordsAnalyze = async function (req, res) {
  const keyword = req.query.keyword;
  const seedKeywords = req.query.seedKeywords ? req.query.seedKeywords.split(',') : [keyword];
  const referenceKeyword = req.query.referenceKeyword ? req.query.referenceKeyword.split(',') : [keyword];

  if (!keyword) {
      return res.render('keyword_dashboard', { detailedData: [] });
  }

  try {
      // 1. Scrape SERP for the given keyword
      const detailedData = await Crawler.scrapeSERPData(keyword);

      // 2. Gather and format keywords from seed
      const formattedKeywords = await Crawler.gatherAndFormatKeywords(seedKeywords, 'allKeywords');

      // 3. Gather and format reference keywords
      const formattedRefKeywords = await Crawler.gatherAndFormatKeyword(referenceKeyword, 'refKeyword');

      // Return all results in a single response
      res.json({
          detailedData,
          allKeywords: formattedKeywords,
          refKeyword: formattedRefKeywords
      });
  } catch (error) {
      console.error("Error in /analyze:", error);
      res.status(500).json({ error: "An error occurred while processing your request." });
  }
};
 
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

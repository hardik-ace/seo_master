'use strict';
// const Dashboard = require('../models/dashboard.model'); 
// const bcrypt = require('bcrypt');
const AuditModel = require('../models/audit.model'); 
const CrawlerModel = require('../models/crawler.model');
const path = require('path');
const fs = require('fs');
const Crawler = require('../helpers/crawler.helpers');
var md5 = require('md5');

exports.findBrokenLinks = async function (req, res) {
  
    const targetUrl = req.query.url;
    
    var id = req.query.id; 
    var customer_id = req.session.customer.id;
    var store_domain = req.session.customer.store_domain;
    const access_token = req.session.customer.access_token;
    var params = " (customer_id='"+customer_id+"' AND id='"+id+"') ";

    const site_audit = await new Promise((resolve, reject) => {
        var params = "status='Completed' and id="+id;
        AuditModel.findOne(params, (err, data) => {
            if (err) { 
                reject(err);  
            } else {
                resolve(data);  
            }
        });
    }); 

    const filePath = path.resolve(__dirname, '../../cron_assets/' + store_domain + '/' + site_audit.folder + '/seo_report_json'+"/"+md5(targetUrl)+".json");

    const filePathCheck = await Crawler.checkFileExist(filePath); 
    
    if(filePathCheck){
    var seoRanks;
    var seoscore;
    var masterLinks;
    var brokenLinks;
    var urlToAnalyze;
    var altImagesCount;
    var allHeadingCounts = {};

        try {
            const data = fs.readFileSync(filePath, 'utf-8'); 
            const seoReportJson = JSON.parse(data);
            console.log(seoReportJson);
            
            seoRanks = seoReportJson.seoRanksData;
            seoscore = seoReportJson.seoscore;
            masterLinks = seoReportJson.masterLinks;
            brokenLinks = seoReportJson.allPages;
            urlToAnalyze = seoReportJson.urlToAnalyze;
            altImagesCount = seoReportJson.altImagesCount;
            allHeadingCounts = seoReportJson.allHeadingCounts;
        } catch (err) {
            console.log(err);
        }

    }else{
        const seoscore = await Crawler.getSeoScore(targetUrl);
        const urlToAnalyze = await Crawler.analyzeSEO(targetUrl);
        const brokenLinks = await Crawler.findBrokenLinks(targetUrl);
        const masterLinks = await Crawler.crawlSinglePage(targetUrl);
        const altImagesCount = urlToAnalyze?.missingAlt.length;

        var seoRanksData;

        if (req.query.tags != "" && req.query.tags != undefined && req.query.tags != "undefined") {
            seoRanksData = [];
            const tags = req.query.tags.split(",");
            tags.forEach(function (tag) {
                seoRanksData = seoRanksData.concat({
                    name: tag.split("_")[0],
                    url: targetUrl,
                    ranking: tag.split("_")[1]
                });
            });
        } else {
            seoRanksData = await Crawler.crawlSinglePageSEORank(targetUrl,store_domain,access_token);    
        } 
        const allHeadingCounts = {};
        urlToAnalyze?.headings.forEach(heading => {
            for (const [key, value] of Object.entries(heading)) {
                allHeadingCounts[`${key.charAt(0).toUpperCase() + key.slice(1)}`] = value.length;
            }
        }); 
    }

    res.render('broken/find-broken-links', { seoRanks: seoRanksData, seoscore: seoscore, masterLinks: masterLinks, allPages: brokenLinks, urlToAnalyze: urlToAnalyze, altImagesCount: altImagesCount, allHeadingCounts: allHeadingCounts });  
};

exports.fetchSeoRanking = async function (req, res) {

  var tags = req.body.tags;
  let googleRankings = [];
  let seoTags = [];
  
  seoTags = await Promise.all(tags.split(" ").map(async (edgeTag) => {
      const query = edgeTag; // Change this to your desired search term
      const targetUrl = req.body.url; // Change this to the URL you want to check
      var ranking = await Crawler.fetchGoogleSearchRankings(query, targetUrl);

      return {
          tag: edgeTag,
          ranking: ranking,
          url: targetUrl,   
          name: edgeTag,
      }

  }));

  googleRankings = googleRankings.concat(seoTags);
  
  res.send({ "googleRankings": googleRankings })
  
};

exports.allPages = async function (req, res) {
    var id = req.query.id; 
    var customer_id = req.session.customer.id;
    var store_domain = req.session.customer.store_domain;
    var params = " (customer_id='"+customer_id+"' AND id='"+id+"') ";

    CrawlerModel.findOne(params, async function (err, data) {
        if (err) {
          req.flash('error', err);
          res.redirect('/dashboard');
        } else {
          if (data) { 
            const filePath = path.resolve(__dirname, '../../cron_assets/' + store_domain + '/' + data.folder + '/crawler_json/'+data.file_name);
           
            var crawledArr = [];
            var brokenLinks = [];
            var toCrawl = [];
            
            if (filePath) {
                try {
                    const data = fs.readFileSync(filePath, 'utf-8'); 
                    const crawledJson = JSON.parse(data);

                    crawledArr = crawledJson.crawled;
                    brokenLinks = crawledJson.brokenLinks;
                    toCrawl = crawledJson.toCrawl;
                } catch (err) {
                    console.log(err);
                }
            } 

            res.render('broken/find-all-pages-broken-links', {
                crawledLinks: crawledArr,
                brokenLinks: brokenLinks,
                toCrawl: toCrawl,
                pageTitle:'Crawler Dashboard'
            });

          } else {
            req.flash('error', 'User does not exist.');
            res.redirect('/dashboard');
          }
        }
    });
   
};

exports.addCrawlerLinks = async function (req, res) {
    var customer_id = req.session.customer.id;
    const currentDate = new Date();
    const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}__${currentDate.getHours().toString().padStart(2, '0')}-${currentDate.getMinutes().toString().padStart(2, '0')}-${currentDate.getSeconds().toString().padStart(2, '0')}`;
    let randomInt = Math.floor(Math.random() * 100000000); 
    randomInt = randomInt.toString().padStart(8, '0'); 

    var addCrawlerLink = {
        customer_id: customer_id, 
        crawler_id: randomInt,
        folder: formattedDate,
        file_name: formattedDate+"_crawledLinks.json",
        status: 'Pending',
    }; 

    CrawlerModel.create(new CrawlerModel(addCrawlerLink), function (err, indertId) {
        if (err) {
            res.send('error: '+ err); 
        } else { 
            res.redirect("/crawler/allPages"); 
        }
    });   
};
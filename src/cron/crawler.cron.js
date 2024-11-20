'use strict';
// const Dashboard = require('../models/dashboard.model'); 
const CrawlerModel = require('../models/crawler.model');
const CustomerModel = require('../models/auth.model');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
// const Crawler = require('../helpers/crawler.helpers');

// Load the saved crawl state (or initialize if not found)
const loadCrawlState = (siteUrl,jsonFilePath) => {
    if (fs.existsSync(jsonFilePath)) {
        const data = fs.readFileSync(jsonFilePath, 'utf-8');
        return JSON.parse(data);
    } else {
        return { crawled: [], toCrawl: [siteUrl], brokenLinks: [] };
    }
};

// Save the crawl state to a JSON file
const saveCrawlState = (siteUrl,jsonFilePath,state) => {
    fs.writeFileSync(jsonFilePath, JSON.stringify(state, null, 2), 'utf-8');
};

// Normalize the URL for consistency
const normalizeUrl = (siteUrl,url) => {
    try {
        return new URL(url, siteUrl).href.replace(/\/+$/, '');  // Remove trailing slashes
    } catch {
        return null;
    }
};

// Check if the link is internal (same domain)
const isInternalLink = (siteUrl,url) => {
    return url && (url.startsWith(siteUrl) || url.startsWith(new URL(siteUrl).origin));
};

// Crawl a single page and extract all internal links
const crawlPage = async (siteUrl, jsonFilePath, url, state, retries = 3) => {
    try {
        const response = await axios.get(url, { timeout: 5000 });
        const $ = cheerio.load(response.data);

        // Extract all internal links
        $('a[href]').each((_, element) => {
            const link = $(element).attr('href');
            const fullUrl = normalizeUrl(siteUrl,link);

            if (fullUrl && isInternalLink(siteUrl,fullUrl) && !state.crawled.includes(fullUrl) && !state.toCrawl.includes(fullUrl)) {
                state.toCrawl.push(fullUrl);
            }
        });

        state.crawled.push(url); // Mark the current URL as crawled
    } catch (error) {
        // Retry on failure or mark the link as broken
        if (retries > 0) {
            await crawlPage(siteUrl,jsonFilePath, url, state, retries - 1); // Retry
        } else {
            state.brokenLinks.push(url); // Mark as broken after retries
        }
    }

    saveCrawlState(siteUrl,jsonFilePath,state); // Save after crawling each link
};

// Recursive crawl function with concurrency
const crawlSite = async (siteUrl,jsonFilePath,maxConcurrent = 10) => {
    const state = loadCrawlState(siteUrl,jsonFilePath);
    let newLinksFound = true;

    // Continue crawling while there are links to crawl
    while (newLinksFound && state.toCrawl.length > 0) {
        newLinksFound = false;
        const linksToProcess = [...state.toCrawl];
        const promises = [];

        // Process links in batches of maxConcurrent
        for (let i = 0; i < Math.min(maxConcurrent, linksToProcess.length); i++) {
            const url = linksToProcess[i];

            if (!state.crawled.includes(url)) {
                promises.push(crawlPage(siteUrl,jsonFilePath, url, state).then(() => {
                    const index = state.toCrawl.indexOf(url);
                    if (index > -1) state.toCrawl.splice(index, 1);
                }));
                newLinksFound = true;
            }
        }

        await Promise.all(promises);
        saveCrawlState(siteUrl,jsonFilePath,state);
    }

    console.log('Crawling completed!');
    console.log('Total crawled links:', state.crawled.length);
    console.log('Broken links:', state.brokenLinks.length);
    return 'Crawling completed!';
};

exports.siteCrawlerCron = async function (req, res) {
  var siteUrl = "https://www.qeapps.com"; 
  
  const crawler_links = await new Promise((resolve, reject) => {
    var params = "status='Padding' LIMIT 2";
    CrawlerModel.find(params, (err, data) => {
      if (err) { 
        reject(err);  
      } else {
        resolve(data);  
      }
    });
  }); 
  
  Object.entries(crawler_links).forEach(async crawler_link => {
    const [key, value] = crawler_link; 

    const customerInfo = await new Promise((resolve, reject) => {
      var params = "id='"+value['customer_id']+"' ";
      CustomerModel.findOne(params, (err, data) => {
        if (err) { 
          reject(err);  
        } else {
          resolve(data);  
        }
      });
    });

    if(customerInfo['store_domain']!=''){
      siteUrl = "https://"+customerInfo['store_domain']; 
    } 

    var jsonFilePath = path.resolve(__dirname, '../../cron_assets/crawler_json/'+value['file_name']);

    var updateDb = {
      status: "Running"
    }
    CrawlerModel.update(value['id'], new CrawlerModel(updateDb), function (err, update_id) { });
    
    var response = await crawlSite(siteUrl,jsonFilePath,10);

    var updateDb = {
      status: "Completed"
    }
    CrawlerModel.update(value['id'], new CrawlerModel(updateDb), function (err, update_id) { });  
  });

  res.end("Crawling completed");
};
 
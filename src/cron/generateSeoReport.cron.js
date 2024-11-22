'use strict';
// const Dashboard = require('../models/dashboard.model'); 
const AuditModel = require('../models/audit.model');
const CustomerModel = require('../models/auth.model');
const Crawler = require('../helpers/crawler.helpers');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path'); 
var md5 = require('md5');
const fsPromises = fs.promises;

// Load the saved audit state (or initialize if not found)
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
    return 'Auditing completed!';
};

const checkCreateFolder = async (folderPath) => {
  try {
    // Check if the folder exists
    await fsPromises.access(folderPath, fs.constants.F_OK);
    console.log('Folder exists');

    // Check if we have full permissions (read, write, execute)
    await fsPromises.access(folderPath, fs.constants.R_OK | fs.constants.W_OK | fs.constants.X_OK);
    console.log('Full permissions available');

    // Ensure no subfolders exist
    const files = await fsPromises.readdir(folderPath);
    const subfolders = files.filter(file => {
      return fs.statSync(path.join(folderPath, file)).isDirectory();
    });

    if (subfolders.length > 0) {
      console.log('Subfolders exist. Preventing further subfolder creation.');
    } else {
      console.log('No subfolders exist.');
    }

  } catch (err) {
    if (err.code === 'ENOENT') {
      // Folder doesn't exist, create it
      console.log('Folder does not exist. Creating folder...');
      await fsPromises.mkdir(folderPath, { recursive: true }); // Create the folder with full permission (including subfolders if necessary)
      console.log('Folder created successfully');
    } else if (err.code === 'EACCES') {
      console.log('Insufficient permissions');
    } else {
      console.error('An error occurred:', err);
    }
  }
}

exports.generateSeoReportCron = async function (req, res) {
  var siteUrl = "https://www.qeapps.com"; 
  
  const site_audit = await new Promise((resolve, reject) => {
    var params = "status='Completed' and site_audit_status='Pending' LIMIT 1";
    AuditModel.find(params, (err, data) => {
      if (err) { 
        reject(err);  
      } else {
        resolve(data);  
      }
    });
  }); 
  
  Object.entries(site_audit).forEach(async site_audit_info => {
    const [key, value] = site_audit_info; 

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

    // var updateDb = { site_audit_status: "Running" };
    // AuditModel.update(value['id'], new AuditModel(updateDb), function (err, update_id) { });

    const filePath = path.resolve(__dirname, '../../cron_assets/' + customerInfo['store_domain'] + '/' + value.folder + '/site_audit_json/'+value.file_name);
                  
    var crawledArr = []; 
    if (filePath) {
        try {
            const data = fs.readFileSync(filePath, 'utf-8'); 
            const crawledJson = JSON.parse(data);
            crawledArr = crawledJson.crawled;
        } catch (err) {
            console.log(err);
        }
    } 

    const folderPath = path.resolve(__dirname, '../../cron_assets/' + customerInfo['store_domain'] + '/' + value['folder'] + '/seo_report_json');
    await checkCreateFolder(folderPath); 

    Object.entries(crawledArr).forEach(async crawled => {
      const [cKey, cValue] = crawled;
      var jsonFilePath = folderPath+"/"+md5(cValue)+".json";
       
      if(cKey <= 10){
        const targetUrl = cValue; 
        const store_domain = customerInfo['store_domain']; 
        const access_token = customerInfo['access_token'];
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
        var seoReports = { 
          seoRanks: seoRanksData, 
          seoscore: seoscore, 
          masterLinks: masterLinks, 
          allPages: brokenLinks, 
          urlToAnalyze: urlToAnalyze,
          altImagesCount:altImagesCount,
          allHeadingCounts:allHeadingCounts 
        }

        const state = saveCrawlState(siteUrl,jsonFilePath,seoReports);
      }
    });

    var updateDb = { site_audit_status: "Completed" };
    AuditModel.update(value['id'], new AuditModel(updateDb), function (err, update_id) { });  
  });

  res.end("Auditing Completed");
};
 
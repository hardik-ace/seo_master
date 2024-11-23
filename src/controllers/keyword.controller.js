'use strict'; 
const Crawler = require('../helpers/crawler.helpers');

exports.relatedLinks = async function (req, res) {
  res.render('keyword/related-links',{pageTitle:'Related Links'});
};
  
exports.relatedKeyword = async function (req, res) {
  res.render('keyword/related-keyword',{pageTitle:'Keyword'});
};
  
exports.serpKeyword = async function (req, res) {
  res.render('keyword/serp-keyword',{pageTitle:'SERP Keyword'});
};
  
exports.keywordRankChecker = async function (req, res) {
  res.render('keyword/keyword-rank-checker',{pageTitle:'Keyword Rank Checker'});
};

exports.crawlerKeywords = async function (req, res) {
  res.render('crawler/keywords-checker');
};
 
exports.keywordsAnalyze = async function (req, res) {
  const analyze_type = req.query.analyze_type;
  const keyword = req.query.keyword;
  const seedKeywords = req.query.seedKeywords ? req.query.seedKeywords.split(',') : [keyword];
  const referenceKeyword = req.query.referenceKeyword ? req.query.referenceKeyword.split(',') : [keyword];

  if (!keyword) {
      return res.render('keyword_dashboard', { detailedData: [] });
  }

  try {
    var responseData;
    if(analyze_type=='serpDataTable'){
      // 1. Scrape SERP for the given keyword
      const detailedData = await Crawler.scrapeSERPData(keyword);
      responseData = {detailedData};
    }

    if(analyze_type=='allKeywordsTable'){
      // 2. Gather and format keywords from seed
      const formattedKeywords = await Crawler.gatherAndFormatKeywords(seedKeywords, 'allKeywords');
      responseData = {allKeywords: formattedKeywords};
    }

    if(analyze_type=='refKeywordTable'){
      // 3. Gather and format reference keywords
      const formattedRefKeywords = await Crawler.gatherAndFormatKeyword(referenceKeyword, 'refKeyword');
      responseData = {refKeyword: formattedRefKeywords};
    }

    // Return all results in a single response
    res.json(responseData);
  } catch (error) {
    console.error("Error in /analyze:", error);
    res.status(500).json({ error: "An error occurred while processing your request." });
  }
};


exports.processKeywordRankChecker = async function (req, res) {
  const search_keyword = req.body.search_keyword;
  const site_url = req.body.site_url;  
  var errorsArr = {};

  if (req.body.search_keyword.length === 0) {
    errorsArr["search_keyword"] = "Keyword is required";
  }

  if (req.body.site_url.length === 0) {
    errorsArr["site_url"] = "Site Url is required";
  }
   
  if (req.body.search_keyword.length !== 0 && req.body.site_url.length !== 0) {
    try {
      var responseData;
      const ranking = await Crawler.fetchGoogleSearchRankings(search_keyword,site_url);
       console.log(ranking);
      responseData = {
        status:'Success',
        pageTitle:'Keyword Rank Checker',
        ranking: ranking,
        search_keyword:search_keyword,
        site_url:site_url
      };
      // Return all results in a single response
      res.json(responseData); 
    } catch (error) {
      // console.error("Error in /analyze:", error); 
      res.json({ status:'Failed', error: "An error occurred while processing your request." });
    }
  }else{  
    res.json({ status:'Failed', errors: errorsArr }); 
  }

  
};
var express = require('express');
var router = express.Router();
const CrawlerCron = require('../cron/crawler.cron');
const SiteAuditCron = require('../cron/siteAudit.cron');
// const userDataValidate = require("../validations/auth.validation");

  
router.get('/siteCrawlerCron', CrawlerCron.siteCrawlerCron);  
router.get('/siteAuditCron', SiteAuditCron.siteAuditCron);  

module.exports = router;
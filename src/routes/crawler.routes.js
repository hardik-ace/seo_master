var express = require('express');
var router = express.Router();
const crawlerController = require('../controllers/crawler.controller');
// const userDataValidate = require("../validations/auth.validation");
 
// Login 
router.get('/', crawlerController.crawlerHomePage);
router.get('/homePage', crawlerController.crawlerHomePage);

router.get('/allPages', crawlerController.crawlerAllPages);

router.get('/keywords', crawlerController.crawlerKeywords);
router.get('/keywordsAnalyze', crawlerController.keywordsAnalyze);

module.exports = router;
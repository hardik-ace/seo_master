var express = require('express');
var router = express.Router();
const brokenController = require('../controllers/broken.controller');
// const userDataValidate = require("../validations/auth.validation");
 
 
// router.get('/', brokenController.brokenLink);
router.get('/findBrokenLinks', brokenController.findBrokenLinks);
router.post('/fetchSeoRanking', brokenController.fetchSeoRanking);

router.get('/allPages', brokenController.allPages);
router.get('/addCrawlerLinks', brokenController.addCrawlerLinks);

module.exports = router;
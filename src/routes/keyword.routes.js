var express = require('express');
var router = express.Router();
const keywordController = require('../controllers/keyword.controller');
// const userDataValidate = require("../validations/auth.validation");
 

router.get('/relatedLinks', keywordController.relatedLinks);
router.get('/relatedKeyword', keywordController.relatedKeyword);
router.get('/serpKeyword', keywordController.serpKeyword);

router.get('/keywordsAnalyze', keywordController.keywordsAnalyze);

router.get('/keywordRankChecker', keywordController.keywordRankChecker);

router.post('/processKeywordRankChecker', keywordController.processKeywordRankChecker);

module.exports = router;
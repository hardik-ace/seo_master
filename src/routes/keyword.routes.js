var express = require('express');
var router = express.Router();
const keywordController = require('../controllers/keyword.controller');
// const userDataValidate = require("../validations/auth.validation");
 

router.get('/keywordRankChecker', keywordController.keywordRankChecker);

module.exports = router;
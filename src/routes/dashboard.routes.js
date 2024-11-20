var express = require('express');
var router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
// const userDataValidate = require("../validations/auth.validation");
 
// Login 
router.get('/', dashboardController.dashboard);
router.get('/index', dashboardController.dashboard);
 

module.exports = router;
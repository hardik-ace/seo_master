var express = require('express');
var router = express.Router();
const auditController = require('../controllers/audit.controller');
// const userDataValidate = require("../validations/auth.validation");
 
  
router.get('/siteAudit', auditController.siteAudit);  
router.get('/addSiteAudit', auditController.addSiteAudit);
router.get('/viewSiteAudited', auditController.viewSiteAudited);

module.exports = router;
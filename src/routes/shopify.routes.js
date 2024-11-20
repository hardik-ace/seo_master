var express = require('express');
var router = express.Router();
const shopifyController = require('../controllers/shopify.controller');
// const userDataValidate = require("../validations/auth.validation");
 
// Login 
router.get('/', shopifyController.shopifyProducts);
router.get('/products', shopifyController.shopifyProducts);
router.get('/getProducts', shopifyController.getProducts);
 
router.get('/collections', shopifyController.shopifyCollections);
router.get('/getCollections', shopifyController.getCollections);

router.get('/pages', shopifyController.shopifyPages);
router.get('/getPages', shopifyController.getPages);

module.exports = router;
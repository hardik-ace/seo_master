var express = require('express');
var router = express.Router();
const authController = require('../controllers/auth.controller');
// const userDataValidate = require("../validations/auth.validation");
 
// Login 
router.get('/', authController.loginView);
router.get('/login', authController.loginView);
router.post('/login', authController.loginProcess);

// Logout
router.get('/logout', authController.logout);

// Register New User
router.get('/register', authController.registerView);
router.post('/register', authController.addRegistration);

module.exports = router;
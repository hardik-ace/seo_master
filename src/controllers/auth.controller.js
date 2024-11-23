'use strict';
const Auth = require('../models/auth.model');
const AuditModel = require('../models/audit.model');
const CrawlerModel = require('../models/crawler.model');

const { validationResult } = require("express-validator");
const bcrypt = require('bcrypt');

exports.loginView = function (req, res) {
  res.render('auth/login');
};

exports.loginProcess = function (req, res) {

  if (req.body.email.length > 0 && req.body.password.length > 0) {
    var params = " (email='" + req.body.email + "' OR user_name='" + req.body.email + "') ";

    Auth.findOne(params, async function (err, user) {
      if (err) {
        req.flash('error', err);
        res.redirect('/auth');
      } else {
        if (user) {
          // var user = user[0];
          // const passwordMatch = await bcrypt.compare(req.body.password, user.password); 
          // if (passwordMatch) {  
          if (user.password == req.body.password) {
            req.session.customer = {
              id: user.id,
              fname: user.fname,
              lname: user.lname,
              email: user.email,
              user_name: user.user_name,
              phone_no: user.phone_no,
              status: user.status,
              store_domain: user.store_domain,
              access_token: user.access_token,
              site_url: "https://"+user.store_domain,
              created_at: user.created_at,
            };

            req.flash('success', 'Login successful');
            res.redirect('/dashboard');

          } else {
            req.flash('error', 'Invalid credentials');
            res.redirect('/auth');
          }
        } else {
          req.flash('error', 'User does not exist.');
          res.redirect('/auth');
        }
      }
    });
  } else {
    req.flash('error', 'Please Enter Email And Password.');
    res.redirect('/auth');
  }

};

exports.registerView = function (req, res) {
  res.render('auth/register');
};

exports.addRegistration = function (req, res) {

  // const errorsM = validationResult(req);

  // if there is error then return Error
  // if (!errorsM.isEmpty()) {
  //   return res.status(400).json({
  //     success: false,
  //     errors: errorsM.array(),
  //   });
  // }

  let errors = false;
  var errorsArr = {};


  if (req.body.fname.length === 0) {
    errorsArr["fname"] = "First Name is required";
  }

  if (req.body.lname.length === 0) {
    errorsArr["lname"] = "Last Name is required";
  }

  if (req.body.phone_no.length === 0) {
    errorsArr["phone_no"] = "Phone No is required";
  }

  if (req.body.user_name.length === 0) {
    errorsArr["user_name"] = "User Name is required";
  }

  if (req.body.email.length === 0) {
    errorsArr["email"] = "Email is required";
  }

  if (req.body.password.length === 0) {
    errorsArr["password"] = "Password is required";
  }

  if (req.body.password_confirm.length === 0) {
    errorsArr["password_confirm"] = "Confirm Password is required";
  }

  if (req.body.password !== req.body.password_confirm) {
    errorsArr["password_confirm"] = "Passwords do not match!";
  }


  if (req.body.fname.length === 0 || req.body.lname.length === 0 || req.body.phone_no.length === 0 || req.body.user_name.length === 0 || req.body.email.length === 0 || req.body.password.length === 0 || req.body.password_confirm.length === 0) {
    errors = true;
    req.body['errors'] = errorsArr;
    res.render('auth/register', req.body);
  }

  // if no error
  if (!errors) {
    const new_user = new Auth(req.body);
    Auth.create(new_user, function (err, user) {
      if (err) {
        req.flash('error', err);
        res.render('auth/register', req.body);
      } else {

        const currentDate = new Date();
        const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}__${currentDate.getHours().toString().padStart(2, '0')}-${currentDate.getMinutes().toString().padStart(2, '0')}-${currentDate.getSeconds().toString().padStart(2, '0')}`;

        // code start for add site audit after register
        var customer_id = user;
        let randomInt = Math.floor(Math.random() * 100000000);
        randomInt = randomInt.toString().padStart(8, '0');

        var addSiteAudits = {
          customer_id: customer_id,
          audit_id: randomInt,
          folder: formattedDate,
          file_name: formattedDate + "_SiteAudit.json",
          status: 'Pending',
          site_audit_status: "Pending",
        };
        AuditModel.create(new AuditModel(addSiteAudits), function (err, indertId) {
          if (err) {
            res.send('error: ' + err);
          }
        });
        // code end for add site audit after register

        // code start for add crwal link after register 
        let randomIntCrawl = Math.floor(Math.random() * 100000000);
        randomIntCrawl = randomIntCrawl.toString().padStart(8, '0');

        var addCrawlerLink = {
          customer_id: customer_id,
          crawler_id: randomIntCrawl,
          folder: formattedDate,
          file_name: formattedDate + "_crawledLinks.json",
          status: 'Pending',
        };

        CrawlerModel.create(new CrawlerModel(addCrawlerLink), function (err, indertId) {
          if (err) {
            res.send('error: ' + err);
          }
        });
        
        req.flash('success', 'Account Registration successfully.');
        res.redirect('/auth');
      }
    });
  }

};

exports.logout = function (req, res) {
  if (req.session.customer) {
    var sessionArray = req.session;
    delete sessionArray.customer;
    req.session = sessionArray;

    req.session.save(function (err) {
      if (err) {
        return next(err);
      } else {
        res.redirect('/auth');
      }
    });
  } else {
    res.render('/auth');
  }
};
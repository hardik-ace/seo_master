'use strict';
const AuditModel = require('../models/audit.model'); 
const path = require('path');
const fs = require('fs');
// const bcrypt = require('bcrypt');
// const Crawler = require('../helpers/crawler.helpers');

exports.siteAudit = async function (req, res) {
  var customer_id = req.session.customer.id;
  //var masterLinksRes; 

  const site_audit = await new Promise((resolve, reject) => {
    var params = "customer_id='"+customer_id+"' ORDER BY id DESC";
    AuditModel.find(params, (err, data) => {
      if (err) { 
        reject(err);  
      } else {
        resolve(data);  
      }
    });
  }); 

   
  res.render('audit/site-audit',{ allPages: site_audit,pageTitle:'Site Audit' });
};

exports.addSiteAudit = async function (req, res) {
  var customer_id = req.session.customer.id;
  const currentDate = new Date();
  const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}__${currentDate.getHours().toString().padStart(2, '0')}-${currentDate.getMinutes().toString().padStart(2, '0')}-${currentDate.getSeconds().toString().padStart(2, '0')}`;
  let randomInt = Math.floor(Math.random() * 100000000); 
  randomInt = randomInt.toString().padStart(8, '0'); 

  var addSiteAudits = {
      customer_id: customer_id, 
      audit_id: randomInt,
      folder: formattedDate,
      file_name: formattedDate+"_SiteAudit.json",
      status: 'Padding',
  };
  console.log(addSiteAudits);
  AuditModel.create(new AuditModel(addSiteAudits), function (err, indertId) {
      if (err) {
          res.send('error: '+ err); 
      } else { 
          res.redirect("/audit/siteAudit"); 
      }
  });   
};

exports.viewSiteAudited = async function (req, res) {
  var id = req.query.id; 
  var customer_id = req.session.customer.id;
  var store_domain = req.session.customer.store_domain;
  var params = " (customer_id='"+customer_id+"' AND id='"+id+"') ";

  AuditModel.findOne(params, async function (err, data) {
      if (err) {
        req.flash('error', err);
        res.redirect('/dashboard');
      } else {
        if (data) { 
          const filePath = path.resolve(__dirname, '../../cron_assets/' + store_domain + '/' + data.folder + '/site_audit_json/'+data.file_name);
                  
          var crawledArr = [];
          var brokenLinks = [];
          var toCrawl = [];
          
          if (filePath) {
              try {
                  const data = fs.readFileSync(filePath, 'utf-8'); 
                  const crawledJson = JSON.parse(data);

                  crawledArr = crawledJson.crawled;
                  brokenLinks = crawledJson.brokenLinks;
                  toCrawl = crawledJson.toCrawl;
              } catch (err) {
                  console.log(err);
              }
          } 

          res.render('audit/view-site-audited', {
              crawledLinks: crawledArr,
              brokenLinks: brokenLinks,
              toCrawl: toCrawl
          });

        } else {
          req.flash('error', 'User does not exist.');
          res.redirect('/dashboard');
        }
      }
  });
 
};
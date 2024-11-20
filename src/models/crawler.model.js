'use strict';
var dbConn = require('./../../config/db.config');
// const bcrypt = require("bcrypt-nodejs");
const bcrypt = require('bcrypt');
const saltRounds = 10; 

var Crawler = function (Crawler) {
  this.id = Crawler.id;
  this.customer_id = Crawler.customer_id;
  this.crawler_id = Crawler.crawler_id;
  this.file_name = Crawler.file_name;
  this.status = Crawler.status;  
};

Crawler.create = async function (newEmp, result) {
  // newEmp.password = await bcrypt.hash(newEmp.password, saltRounds).then((hash) => {  return hash; });
  dbConn.query("INSERT INTO crawler_links set ?", newEmp, function (err, res) {
    if (err) { 
      result(err, null);
    }else { 
      result(null, res.insertId);
    }
  });
};

Crawler.findAll = function (result) {
  dbConn.query("SELECT * FROM crawler_links", function (err, res) {
    if (err) { 
      result(null, err);
    } else { 
      result(null, res);
    }
  });
};

Crawler.find = function (params, result) {
  dbConn.query("SELECT * FROM crawler_links WHERE 1 and " + params, function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else { 
      result(null, res);
    }
  });
};

Crawler.findOne = function (params, result) {
  dbConn.query("SELECT * FROM crawler_links WHERE 1 AND " + params, function (err, res) {
    if (err) { 
      result(null, err);
    } else {  
      result(null, res[0]);
    }
  });
};

Crawler.findById = function (id, result) { 
  dbConn.query("SELECT * FROM crawler_links WHERE id = ? ", id, function (err, res) { 
    if (err) { 
      result(err, null);
    } else {
      result(null, res[0]);
    }
  });
};

Crawler.update = function (id, params, result) {
  Object.keys(params).forEach(key => {
    if (params[key] === undefined) {
      delete params[key];
    }
  });

  dbConn.query("UPDATE crawler_links SET ? WHERE id = ?", [params, id], function (err, res) {
    if (err) { 
      result(null, err);
    } else { 
      result(null, id);
    }
  });
};


module.exports = Crawler;
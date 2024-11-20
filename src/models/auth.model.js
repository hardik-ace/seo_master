'use strict';
var dbConn = require('./../../config/db.config');
// const bcrypt = require("bcrypt-nodejs");
const bcrypt = require('bcrypt');
const saltRounds = 10; 

var Auth = function (Auth) {
  this.fname = Auth.fname;
  this.lname = Auth.lname;
  this.email = Auth.email;
  this.user_name = Auth.user_name;
  this.phone_no = Auth.phone_no; 
  this.password = Auth.password, 
  this.status = (Auth.status ? Auth.status : "Active"),
  this.store_domain = Auth.store_domain, 
  this.access_token = Auth.access_token
  // this.created_at = new Date();
  // this.updated_at = new Date();
};

Auth.create = async function (newEmp, result) {
  // newEmp.password = await bcrypt.hash(newEmp.password, saltRounds).then((hash) => {  return hash; });
  dbConn.query("INSERT INTO customer set ?", newEmp, function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(err, null);
    }else { 
      result(null, res.insertId);
    }
  });
};

Auth.findOne = function (params, result) {
  dbConn.query("SELECT * FROM customer WHERE 1 AND " + params, function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else {  
      result(null, res[0]);
    }
  });
};

module.exports = Auth;
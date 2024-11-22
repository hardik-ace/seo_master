'use strict';
var dbConn = require('./../../config/db.config');
// const bcrypt = require("bcrypt-nodejs");
const bcrypt = require('bcrypt');
const saltRounds = 10; 

var Audit = function (Audit) {
  this.id = Audit.id;
  this.customer_id = Audit.customer_id;
  this.audit_id = Audit.audit_id;
  this.folder = Audit.folder;
  this.file_name = Audit.file_name;
  this.status = Audit.status;  
  this.site_audit_status = Audit.site_audit_status;
};

Audit.create = async function (newEmp, result) {
  // newEmp.password = await bcrypt.hash(newEmp.password, saltRounds).then((hash) => {  return hash; });
  dbConn.query("INSERT INTO site_audit set ?", newEmp, function (err, res) {
    if (err) { 
      result(err, null);
    }else { 
      result(null, res.insertId);
    }
  });
};

Audit.findAll = function (result) {
  dbConn.query("SELECT * FROM site_audit", function (err, res) {
    if (err) { 
      result(null, err);
    } else { 
      result(null, res);
    }
  });
};

Audit.find = function (params, result) {
  dbConn.query("SELECT * FROM site_audit WHERE 1 and " + params, function (err, res) {
    if (err) {
      console.log("error: ", err);
      result(null, err);
    } else { 
      result(null, res);
    }
  });
};

Audit.findOne = function (params, result) {
  dbConn.query("SELECT * FROM site_audit WHERE 1 AND " + params, function (err, res) {
    if (err) { 
      result(null, err);
    } else {  
      result(null, res[0]);
    }
  });
};

Audit.findById = function (id, result) { 
  dbConn.query("SELECT * FROM site_audit WHERE id = ? ", id, function (err, res) { 
    if (err) { 
      result(err, null);
    } else {
      result(null, res[0]);
    }
  });
};

Audit.update = function (id, params, result) {
  Object.keys(params).forEach(key => {
    if (params[key] === undefined) {
      delete params[key];
    }
  });

  dbConn.query("UPDATE site_audit SET ? WHERE id = ?", [params, id], function (err, res) {
    if (err) { 
      result(null, err);
    } else { 
      result(null, id);
    }
  });
};


module.exports = Audit;
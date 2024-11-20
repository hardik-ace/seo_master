'use strict';
const mysql = require('mysql');
//local mysql db connection

const dbConn = mysql.createConnection({
  host     : process.env.DATABASE_HOSTNAME,
  user     : process.env.DATABASE_USERNAME,
  password : process.env.DATABASE_PASSWORD,
  database : process.env.DATABASE_NAME,
});

dbConn.connect(function(err) {
  if (err) throw err;
  console.log("Database Connected!");
});

module.exports = dbConn;
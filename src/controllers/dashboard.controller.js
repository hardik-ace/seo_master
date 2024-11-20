'use strict';
// const Dashboard = require('../models/dashboard.model'); 
const bcrypt = require('bcrypt');

exports.dashboard = function (req, res) {
  
  res.render('dashboard/index');
};
 
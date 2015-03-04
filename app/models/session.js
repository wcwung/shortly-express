var db = require('../config');
var Promise = require('bluebird');

var Session = db.Model.extend({
  tableName: 'sessions',

});

module.exports = Session;

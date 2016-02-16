'use strict';

// Silent logger for use in testing
var winston = require('winston');
module.exports = new winston.Logger({
  level: 'error',
  transports: []
});

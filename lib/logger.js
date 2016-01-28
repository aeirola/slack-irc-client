'use strict';

var winston = require('winston');

var logger = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)()
  ]
});

module.exports = logger;

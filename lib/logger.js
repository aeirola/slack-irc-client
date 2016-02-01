'use strict';

var winston = require('winston');

module.exports = new winston.Logger({
  level: 'info',
  transports: [
    new (winston.transports.Console)()
  ]
});

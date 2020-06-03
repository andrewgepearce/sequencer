// Copyright (C) 2019 Mark The Page

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

'use strict';

const {
  createLogger,
  format,
  transports
} = require('winston');

const path = require('path');

require('winston-daily-rotate-file');

var logRotateTransport = new(transports.DailyRotateFile)({
  filename: 'seqeuncer-%DATE%.log',
  datePattern: 'YYYY-MM-DD-HH',
  zippedArchive: true,
  utc: true,
  createSymlink: true,
  symlinkName: 'sequencer-current.log',
  //maxSize: '20m',
  maxFiles: '14d'
});

logRotateTransport.on('logRemoved', function (removedFilename) {
  logger.info(`Log file ${removedFilename} removed`);
});

const myFormat = format.printf(({
  level,
  message,
  ms
}) => {
  var d = new Date();
  var nowv = d.toISOString();
  let levelv = typeof level == "string" ? level : null;
  let messagev = typeof message == "string" ? message : null;
  let msv = typeof ms == "string" ? ms : null;
  return JSON.stringify({
    date: nowv,
    ms: msv,
    level: levelv,
    message: messagev
  });
});

const logger = createLogger({
  level: 'debug',
  exitOnError: false,
  format: format.combine(format.ms(), myFormat),
  transports: [new transports.Console(), logRotateTransport]
});

logger.stream = {
  write: function (message, encoding) {
    logger.info(message);
  }
};

module.exports = logger;
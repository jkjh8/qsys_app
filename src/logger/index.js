const winston = require('winston')
const wd = require('winston-daily-rotate-file')
const path = require('node:path')

// initialize functions
const { combine, timestamp, label, printf } = winston.format
// path
const logpath = path.join('D:/Data/log/qsys', 'app')

const logformat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level} ${message}`
})

const logger = winston.createLogger({
  format: combine(timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logformat),
  transports: [
    new wd({
      level: 'info',
      dataPattern: 'YYYY-MM-DD',
      dirname: logpath,
      finename: `%DATE%.log`,
      maxFiles: 30,
      zippedArchive: true
    })
  ],
  exceptionHandlers: [
    new wd({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logpath,
      filename: `%DATE%.exception.log`,
      maxFiles: 30,
      zippedArchive: true
    })
  ]
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(winston.format.colorize(), logformat)
    })
  )
}

module.exports = logger

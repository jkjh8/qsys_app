const dbLogs = require('@db/models/logs')
const { log } = require('winston')

module.exports = {
  logError: (message, source = '', zones = []) => {
    dbLogs.create({
      level: 'error',
      levelNum: 0,
      message,
      source,
      zones
    })
  },
  logWarn: (message, source = '', zones = []) => {
    dbLogs.create({
      level: 'warn',
      levelNum: 1,
      message,
      source,
      zones
    })
  },
  logInfo: (message, source = '', zones = []) => {
    dbLogs.create({
      level: 'info',
      levelNum: 2,
      message,
      source,
      zones
    })
  },
  logDebug: (message, source = '', zones = []) => {
    dbLogs.create({
      level: 'debug',
      levelNum: 3,
      message,
      source,
      zones
    })
  },
  logEvent: (message, source = '', zones = []) => {
    dbLogs.create({
      level: 'event',
      levelNum: 4,
      message,
      source,
      zones
    })
  }
}

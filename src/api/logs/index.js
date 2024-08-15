const dbLogs = require('@db/models/logs')
const moment = require('moment')
moment.locale('ko')
const log = (level, levelNum, message, source = '', zones = []) => {
  dbLogs
    .create({ level, levelNum, message, source, zones })
    .then((result) => {
      //
    })
    .catch((err) => {
      console.log(err)
    })
  if (process.env.NODE_ENV !== 'production') {
    let color = ''
    switch (level) {
      case 'error':
        color = '\x1b[31m'
        break
      case 'warn':
        color = '\x1b[33m'
        break
      case 'info':
        color = '\x1b[32m'
        break
      case 'debug':
        color = '\x1b[35m'
        break
      case 'event':
        color = '\x1b[36m'
        break
      default:
        color = ''
    }
    console.log(
      `${color}${moment().format(
        'YYYY-MM-DD HH:mm:ss a'
      )} ${level} ${message}, ${source} ${zones}\x1b[0m`
    )
  }
}

module.exports = {
  logError: (message, source = '', zones = []) => {
    log('error', 0, message, source, zones)
  },
  logWarn: (message, source = '', zones = []) => {
    log('warn', 1, message, source, zones)
  },
  logInfo: (message, source = '', zones = []) => {
    log('info', 2, message, source, zones)
  },
  logDebug: (message, source = '', zones = []) => {
    log('debug', 3, message, source, zones)
  },
  logEvent: (message, source = '', zones = []) => {
    log('event', 4, message, source, zones)
  }
}

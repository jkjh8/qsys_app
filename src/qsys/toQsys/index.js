const qsys = require('..')
const logger = require('@logger')

const fnGetQsysStatus = (deviceId) => {
  try {
    qsys.obj[deviceId].addCommand({ id: 1000, method: 'StatusGet', params: {} })
  } catch (error) {
    logger.error(`Get Qsys status error -- ${error}`)
  }
}

const fnSetPaFB = (deviceId, value = true) => {
  try {
    qsys.obj[deviceId].addCommand({
      id: 2000,
      method: 'PA.ZoneStatusConfigure',
      params: { Enabled: value }
    })
  } catch (error) {
    logger.error(`set qsys pa feedback -- ${error}`)
  }
}

module.exports = { fnGetQsysStatus, fnSetPaFB }

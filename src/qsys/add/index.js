const logger = require('@logger')
const Qrc = require('../qrc')
const { fnSendSocket } = require('@api/socket')
const { fnSetPaFB } = require('@qsys/toQsys')
const qsys = require('@qsys')

const fnAQs = (devices) => {
  try {
    qsys.arr = devices

    devices.forEach((device) => {
      const { deviceId } = device
      if (qsys.obj[deviceId] === null || qsys.obj[deviceId] === undefined) {
        fnAQ(device)
      }
    })
    for (let deviceId in qsys.obj) {
      if (devices.findIndex((item) => item.deviceId === deviceId) === -1) {
        qsys.obj[deviceId].disconnect()
        delete qsys.obj[deviceId]
        logger.warn(`Qsys removed ${deviceId}`)
      }
    }
  } catch (error) {
    logger.error(`AQs error: ${error}`)
  }
}

const fnAQ = async (device) => {
  try {
    const { deviceId, name, ipaddress } = device
    if (qsys.obj[deviceId] && qsys.obj[deviceId].connected) return
    if (!ipaddress || ipaddress === undefined) return
    //
    qsys.obj[deviceId] = new Qrc(device)

    qsys.obj[deviceId].on('connect', () => {
      try {
        qsys.arr[
          qsys.arr.findIndex((item) => item.deviceId === deviceId)
        ].connected = true
        fnSetPaFB(deviceId)
        fnSendSocket('qsys:connect', { deviceId, name, ipaddress })
        logger.info(`Qsys ${name} ${ipaddress} connected`)
      } catch (error) {
        logger.error(`Qsys connect error ${error}`)
      }
    })
    // Qsys disconnect
    qsys.obj[deviceId].on('disconnect', () => {
      try {
        const idx = qsys.arr.findIndex((item) => item.)
        qsys.arr[
          qsys.arr.findIndex((item) => item.deviceId === deviceId)
        ].connected = false
        fnSendSocket('qsys:disconnect', { deviceId, name, ipaddress })
        qsysReconnect(device)
        logger.info(`Qsys ${name} ${ipaddress} disconnected`)
      } catch (error) {
        logger.error(`Qsys disconnect error -- ${error}`)
      }
    })
    // Qsys error
    qsys.obj[deviceId].on('error', (err) => {
      logger.error(`Qsys ${name} ${ipaddress} error -- ${err}`)
    })
    // Qsys on data
    qsys.obj[deviceId].on('data', (data) => {
      if (Object.keys(qsys.obj).includes(deviceId)) {
        try {
          require('../fromQsys')(deviceId, data)
        } catch (error) {
          logger.error(`Qsys ${name} ${ipaddress} data error -- ${error}`)
        }
      }
    })
    qsys.obj[deviceId].connect()
  } catch (error) {
    logger.error(`AQ error: ${error}`)
  }
}

const qsysReconnect = (device) => {
  setTimeout(() => {
    const idx = qsys.arr.findIndex((e) => e.deviceId === device.deviceId)
    if (idx !== -1) {
      fnAQ(device)
    }
  }, 5000)
}

module.exports = { fnAQs, fnAQ }

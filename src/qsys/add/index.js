const qsys = require('@qsys')
const logger = require('@logger')
const dbQsys = require('@db/models/qsys')
const dbBarix = require('@db/models/barix')
const Qrc = require('../qrc')
const { fnSendSocket } = require('@api/socket')
const { fnSetPaFeedback } = require('@qsys/toQsys')

const fnGetQsysFromDB = async () => {
  dbQsys
    .find()
    .populate(
      'ZoneStatus.destination',
      'name idx deviceId ipaddress status streamurl'
    )
    .then((res) => {
      fnAQs(res)
    })
    .catch((err) => {
      logger.error(err)
    })
}

const fnAQs = (devices) => {
  try {
    qsys.arr = [...devices]

    devices.forEach((device) => {
      const { deviceId } = device
      if (!qsys.obj[deviceId]) {
        fnAQ(device)
      }
    })

    Object.keys(qsys.obj).forEach((deviceId) => {
      if (devices.findIndex((item) => item.deviceId === deviceId) === -1) {
        qsys.obj[deviceId].disconnect()
        delete qsys.obj[deviceId]
        logger.warn(`Qsys removed ${deviceId}`)
      }
    })
  } catch (error) {
    logger.error(`AQs error: ${error}`)
  }
}

const fnAQ = async (device) => {
  try {
    const { deviceId, name, ipaddress } = device
    if (qsys.obj[deviceId]?.connected || !ipaddress) return
    qsys.obj[deviceId] = new Qrc(device)

    qsys.obj[deviceId].on('connect', () => {
      try {
        const idx = qsys.arr.findIndex((item) => item.deviceId === deviceId)
        if (idx !== -1) {
          qsys.arr[idx].connected = true
          // db에 업데이트
          dbQsys.updateOne({ deviceId }, { connected: true }).exec()
          fnSetPaFeedback(deviceId)
          // send socket
          fnSendSocket('qsys:connect', { deviceId, name, ipaddress })
          // 볼륨 뮤트 수집
          logger.info(`Qsys ${name} ${ipaddress} connected`)
        } else {
          logger.warn(`Qsys connect: ${deviceId} does not exist`)
        }
      } catch (error) {
        logger.error(`Qsys connect error: ${error}`)
      }
    })
    // Qsys disconnect
    qsys.obj[deviceId].on('disconnect', () => {
      try {
        // Send socket disconnect
        // find qsys device index
        const idx = qsys.arr.findIndex((item) => item.deviceId === deviceId)
        if (idx !== -1) {
          if (qsys.arr[idx].connected) {
            dbQsys.updateOne({ deviceId }, { connected: false }).exec()
            fnSendSocket('qsys:disconnect', { deviceId, name, ipaddress })
            logger.info(`Qsys ${name} ${ipaddress} disconnected`)
          }
          qsys.arr[idx].connected = false
          qsysReconnect(device)
        } else {
          logger.warn(`Qsys disconnect: ${deviceId} does not exist`)
        }
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

module.exports = { fnAQs, fnAQ, fnGetQsysFromDB }

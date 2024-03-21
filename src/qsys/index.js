const logger = require('@logger')
const Qrc = require('./qrc')
const { fnSendSocket } = require('@api/socket')

let qsysObj = {}
let qsysArr = []

const fnAQs = (devices) => {
  try {
    qsysArr = devices
    devices.forEach((device) => {
      const { deviceId } = device
      if (qsysObj[deviceId] === null || qsysObj[deviceId] === undefined) {
        fnAQ(device)
      }
    })
    // 리스트에 없는 경우 삭제
    for (let deviceId in qsysObj) {
      if (devices.findIndex((e) => e.deviceId === deviceId) === -1) {
        qsysObj[deviceId].disconnect()
        delete qsysObj[deviceId]
        logger.warn(`Qsys removed ${deviceId}`)
      }
    }
  } catch (error) {
    logger.error(`Add Qsys devices error ${error}`)
  }
}

const fnAQ = (device) => {
  try {
    const { deviceId, name, ipaddress } = device
    // 중복확인
    if (qsysObj[deviceId] && qsysObj[deviceId].connected) return
    // 생성
    qsysObj[deviceId] = new Qrc(device)
    // Qsys connect
    qsysObj[deviceId].on('connect', () => {
      qsysObj[deviceId].connected = true
      fnSendSocket('qsys:connect', { deviceId, name, ipaddress })
      logger.info(`Qsys ${name} ${ipaddress} connected`)
    })
    // Qsys disconnect
    qsysObj[deviceId].on('disconnect', () => {
      qsysObj[deviceId].connected = false
      fnSendSocket('qsys:disconnect', { deviceId, name, ipaddress })
      qsysReconnect(device)
      logger.info(`Qsys ${name} ${ipaddress} disconnected`)
    })
    // Qsys error
    qsysObj[deviceId].on('error', (err) => {
      logger.error(`Qsys ${name} ${ipaddress} error -- ${err}`)
    })
    // Qsys on data
    qsysObj[deviceId].on('data', (data) => {
      if (Object.keys(qsysObj).includes(deviceId)) {
        try {
          console.log(data)
        } catch (error) {
          logger.error(`Qsys ${name} ${ipaddress} data error -- ${error}`)
        }
      }
    })
    qsysObj[deviceId].connect()
  } catch (error) {
    logger.error(`Add Qsys device error ${error}`)
  }
}

const qsysReconnect = (device) => {
  setTimeout(() => {
    const idx = qsysArr.findIndex((e) => e.deviceId === device.deviceId)
    if (idx !== -1) {
      fnAQ(device)
    }
  }, 5000)
}

module.exports = { qsysObj, qsysArr, fnAQs, fnAQ }
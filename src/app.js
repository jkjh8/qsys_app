require('module-alias/register')
const logger = require('@logger')
const socket = require('./socket')

try {
  socket.connectIO()
} catch (error) {
  logger.error(`Socket.io error: ${error}`)
}

// try {
//   socket = io('http://localhost:3000/qsys', {
//     transports: ['websocket'],
//     autoConnect: true
//   })

//   socket.on('connect', () => {
//     logger.info('Socket.io connected')
//   })

//   socket.on('disconnect', () => {
//     logger.info('Socket.io disconnected')
//   })

//   socket.on('qsys:volume', (obj) => {
//     try {
//       fnSetV(obj.deviceId, obj.zone, obj.value)
//     } catch (error) {
//       logger.error(`Qsys volume update error: ${error}`)
//     }
//   })

//   socket.on('qsys:mute', (obj) => {
//     try {
//       fnSetM(obj.deviceId, obj.zone, obj.value)
//     } catch (error) {
//       logger.error(`Qsys Mute update error: ${error}`)
//     }
//   })

//   socket.on('qsys:tr', (obj) => {
//     try {
//       fnSTr(obj)
//     } catch (error) {
//       logger.error(`Qsys Set transmitter error: ${error}`)
//     }
//   })

//   socket.on('qsys:devices', (arr) => {
//     try {
//       fnAQs(arr)
//       qsys.arr = arr
//       logger.info(`Qsys devices updated: ${arr.length}`)
//     } catch (error) {
//       logger.error(`Qsys devices update error: ${error}`)
//     }
//   })
//   logger.info('Socket.io started')
// } catch (error) {
//   logger.error(error)
// }

// exports.socket = socket

import { io } from 'socket.io-client'
import logger from '@/logger'

import { socketFunc } from './func'

let socket

const connectSocket = () => {
  try {
    socket = io('http://localhost:3000/bridge', {
      transports: ['websocket'],
      autoConnect: true
    })

    socket.on('connect', () => {
      logger.info('Socket.io connected')
    })

    socket.on('disconnect', () => {
      logger.warn('Socket.io disconnected')
    })
    // functions
    socketFunc(socket)
    logger.info('Socket.io started')
  } catch (error) {
    logger.error(`Socket.io connection error: ${error}`)
  }
}

export { connectSocket, socket }

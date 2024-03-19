import logger from '@/logger'
import { fnAddQsyses } from '@/qsys'

export function socketFunc(socket) {
  socket.on('qsys:devices', (arr) => {
    try {
      fnAddQsyses(arr)
      logger.info(`Qsys device updated: ${arr.length}`)
    } catch (error) {
      logger.error(`Qsys device update error: ${error}`)
    }
  })
}

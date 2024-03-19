import { connectSocket } from './socket'
try {
  connectSocket()
} catch (error) {
  console.log(error)
}

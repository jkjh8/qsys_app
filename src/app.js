require('module-alias/register')

const { connectSocket } = require('@socket')

try {
  // console.log('connectSocket')
  connectSocket()
} catch (error) {
  console.log(error)
}

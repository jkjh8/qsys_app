const mongoose = require('mongoose')
const { logDebug } = require('@logger')
mongoose
  .connect(process.env.MONGODB_ADDR)
  .then(() => {
    logDebug('데이터 베이스가 연결되었습니다.', 'server', 'db')
  })
  .catch((err) => console.error(err))

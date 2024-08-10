const mongoose = require('mongoose')
const logger = require('@logger')

mongoose
  .connect(
    `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_ADDR}`
  )
  .then(() => {
    logger.info('DB01 데이터 베이스가 연결', 'server')
  })
  .catch((err) => logger.error(err))

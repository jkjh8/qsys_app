const dbQsys = require('@db/models/qsys')
const logger = require('@logger')

const fnGetQsysFromDB = () => {
  dbQsys
    .find({})
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      logger.error(err)
    })
}

module.exports = {
  fnGetQsysFromDB
}

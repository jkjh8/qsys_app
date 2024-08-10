const Hangul = require('hangul-js')

const searchArrToStr = (arr) => {
  return Hangul.disassembleToString(arr.join('#').replace(/ /g, ''))
}

const makeSearchField = (schema, searchField, getter) => {
  schema.pre('save', function () {
    this[searchField] = getter(this)
  })
  schema.post('updateOne', async function () {
    this.model.findOne(this.getFilter()).then((doc) => {
      if (doc) {
        return docUpated.save()
      }
    })
  })
}

module.exports = {
  searchArrToStr,
  makeSearchField
}

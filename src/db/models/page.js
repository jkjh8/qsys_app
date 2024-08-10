const mongoose = require('mongoose')

const pageSchema = new mongoose.Schema(
  {
    idx: String,
    name: String,
    schedule: String,
    user: String,
    Mode: String,
    dub: Array,
    schedule: { type: Boolean, default: false },
    MaxPageTime: Number,
    Station: { type: Number, default: 1 },
    Priority: { type: Number, default: 3 },
    file: Object,
    devices: [
      {
        deviceId: String,
        name: String,
        ipaddress: String,
        params: Object,
        barix: Array,
        PageID: Number,
        State: String,
        SubState: String,
        Message: String,
        amx: String,
        zones: Array
      }
    ]
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Page', pageSchema)

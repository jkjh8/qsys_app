const EventEmitter = require('events').EventEmitter
const net = require('net')
// import { removeQsys } from '..'

module.exports = class Qrc extends EventEmitter {
  constructor(obj) {
    super()
    this.name = `${obj.name} - ${obj.ipaddress}`
    // tcp socket
    this.ipaddress = obj.ipaddress
    this.client = new net.Socket()
    this.ivConnection = null
    this.ivReconnect = null
    this.timeout = 60
    this.connected = false
    this.setDisconnect = false
    // commands
    this.commands = []
    this.ivCommands = null
    // data
    this.data = Buffer.alloc(0)

    // events
    this.client.on('connect', () => {
      this.connected = true
      this.emit('connect')
      // socket keep alive
      this.setTimeout()
      if (this.ivReconnect) {
        clearInterval(this.ivReconnect)
        this.ivReconnect = null
      }
    })

    this.client.on('close', () => {
      this.connected = false
      clearInterval(this.ivConnection)
      this.ivConnection = null
      this.client.removeAllListeners()
      // if (!this.setDisconnect) {
      //   this.reconnect()
      // }
      this.emit('disconnect')
    })

    this.client.on('timeout', () => {
      this.emit('error', `qsys ${this.name} connection timeout`)
    })

    this.client.on('error', (err) => {
      this.client.end()
      this.emit('error', `qsys error -- ${err}`)
    })

    this.client.on('data', (data) => {
      try {
        this.data = Buffer.concat([this.data, data])
        if (data.includes('\x00')) {
          const _data = this.data
            .toString()
            .trim()
            .split('\x00')
            .filter((element) => {
              return element !== undefined && element !== null && element !== ''
            })
            .map((el) => JSON.parse(el))
          // emit data
          this.emit('data', _data)
          // reset buffer
          this.data = Buffer.alloc(0)
        }
      } catch (err) {
        this.emit('error', `qsys ${this.name} data receive error -- ${err}`)
      }
    })
  }

  connect() {
    if (this.connected) {
      return this.emit('error', `qsys ${this.name} is already connected`)
    }
    try {
      this.client.connect({ port: 1710, host: this.ipaddress })
    } catch (err) {
      this.emit('error', `qsys ${this.name} connect error -- ${err}`)
    }
  }

  disconnect() {
    if (this.ivCommands) {
      clearInterval(this.ivCommands)
    }
    if (this.ivConnection) {
      clearInterval(this.ivConnection)
    }
    this.ivCommands = null
    this.ivConnection = null

    if (this.connected) {
      this.client.end()
    }
  }

  addCommand(msg) {
    this.commands.push(msg)
    if (!this.ivCommands) {
      this.commandProcess()
    }
  }

  commandProcess() {
    this.ivCommands = setInterval(() => {
      if (this.commands.length > 0) {
        if (this.connected) {
          this.send(this.commands.shift())
        }
      } else {
        clearInterval(this.ivCommands)
        this.ivCommands = null
      }
    }, 500)
  }

  send(msg) {
    if (this.connected) {
      this.client.write(
        JSON.stringify({
          jsonrpc: '2.0',
          ...msg
        }) + '\x00'
      )
      this.timeout = 60
    } else {
      this.emit(
        'error',
        `qsys ${this.name} send data failed -- socket not connected command: ${msg}`
      )
    }
  }

  setTimeout() {
    if (this.ivConnection) {
      return this.emit(
        'error',
        `qsys ${this.name} set connection timeout failed -- timeout interval is alive`
      )
    } else {
      try {
        this.ivConnection = setInterval(() => {
          this.timeout = this.timeout - 1
          if (this.timeout < 5) {
            this.addCommand({ method: 'NoOp', params: {} })
            this.emit('debug', `qsys ${this.name} -- noOp`)
          }
          // clear interval at disconnected
          if (!this.connected) {
            clearInterval(this.ivConnection)
            this.ivConnection = null
            this.emit(
              'error',
              `qsys ${this.name} clear interval -- socket not connected`
            )
          }
        }, 1000)
      } catch (error) {
        this.emit(
          'error',
          `qsys ${this.name} connection check error -- ${this.name}`
        )
      }
    }
  }
}

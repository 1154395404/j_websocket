// eslint-disable-next-line camelcase
class J_InterceptorManager {
  constructor () {
    this.handle = []
  }

  use (resolve, reject) {
    this.handle.push({
      resolve,
      reject
    })
  }
}

// eslint-disable-next-line camelcase
class J_EventBus {
  constructor () {
    this.callbackId = 0
    this.eventList = {}
  }

  publish (type, ...args) {
    const callbackMap = this.eventList[type]
    if (!callbackMap) return console.warn(type + '事件未被订阅!')
    const callbackList = Object.entries(callbackMap)
    callbackList.forEach(([id, handleFn]) => {
      handleFn(...args)
      if (id.includes('once')) {
        delete callbackMap[id]
      }
    })
    // 如果这个事件没有订阅者了，也把整个事件对象清除
    if (Object.keys(callbackMap).length === 0) {
      delete this.eventList[type]
    }
  }

  publishByInterceptor (executePromiseChain, type, ...args) {
    const callbackMap = this.eventList[type]
    if (!callbackMap) return console.warn(type + '事件未被订阅!')
    const callbackList = Object.entries(callbackMap)
    callbackList.forEach(([id, handleFn]) => {
      executePromiseChain(...args, handleFn)
      if (id.includes('once')) {
        delete callbackMap[id]
      }
    })
    // 如果这个事件没有订阅者了，也把整个事件对象清除
    if (Object.keys(callbackMap).length === 0) {
      delete this.eventList[type]
    }
  }

  subscribeValidate (type, callback) {
    if (typeof type !== 'string') {
      throw new Error('第一个参数类型必须为string')
    }
    if (typeof callback !== 'function') {
      throw new Error('第二个参数必须为一个函数')
    }
  }

  unSubscribe (type, id) {
    return () => {
      delete this.eventList[type][id]
      // 如果这个事件没有订阅者了，也把整个事件对象清除
      if (Object.keys(this.eventList[type]).length === 0) {
        delete this.eventList[type]
      }
    }
  }

  subscribe (type, callback) {
    this.subscribeValidate(type, callback)
    if (!this.eventList[type]) this.eventList[type] = {}
    const id = this.callbackId++
    this.eventList[type][id] = callback
    // 返回取消订阅函数
    return this.unSubscribe(type, id)
  }

  subscribeOnce (type, callback) {
    this.subscribeValidate(type, callback)
    if (!this.eventList[type]) this.eventList[type] = {}
    const id = 'once' + this.callbackId++
    this.eventList[type][id] = callback
    // 返回取消订阅函数
    return this.unSubscribe(type, id)
  }
}

// eslint-disable-next-line camelcase
module.exports = class J_Socket {
  callbackStack = {}
  connected = false

  constructor (url) {
    this.url = url
    this.ws = new WebSocket(url)
    this.event = new J_EventBus()
    this.temporaryStorageRequestStack = []
    this.interceptors = {
      request: new J_InterceptorManager(),
      response: new J_InterceptorManager()
    }
    this.randomPrefix = parseInt(Math.random() * 100 + '') + '_J_Socket_'
    this.fixedEventType = {
      connect: this.randomPrefix + 'connect',
      disconnect: this.randomPrefix + 'disconnect',
      close: this.randomPrefix + 'close',
      error: this.randomPrefix + 'error',
      sendHeartBeat: this.randomPrefix + 'sendHeartBeat',
      closeHeartBeat: this.randomPrefix + 'closeHeartBeat'
    }
    this.connected = false
    this.heartbeat = {
      setConfig: () => {
      },
      onSendHeartBeat: (callback) => {
      },
      onClose: (callback) => {
      }
    }
    this.heartbeat = this.heartbeatInit()
    this.init()
  }

  init () {
    this.ws.onopen = () => {
      this.connected = true
      this.heartbeat.start()
      this.event.publish(this.fixedEventType.connect)
      while (this.temporaryStorageRequestStack.length) {
        this.temporaryStorageRequestStack.shift()()
      }
    }
    this.ws.onmessage = ({ data }) => {
      const {
        type,
        data: respondData
      } = JSON.parse(data)
      this.event.publishByInterceptor(this.executePromiseChain.bind(this), type, respondData)
    }
    this.ws.onclose = () => {
      this.event.publish(this.fixedEventType.disconnect)
      this.connected = false
    }
    this.ws.onerror = () => {
      this.event.publish(this.fixedEventType.error)
      this.connected = false
    }
  }

  heartbeatInit () {
    const outThis = this
    const heartbeat = {
      config: {
        count: 0,
        pollingInterval: 1000 * 60 * 60,
        maxTimeout: 1000 * 60 * 60,
        pollingIntervalId: -1,
        maxTimeoutId: -1
      },
      setConfig (pollingInterval, maxTimeout) {
        this.config.pollingInterval = pollingInterval
        this.config.maxTimeout = maxTimeout
      },
      onSendHeartBeat (callback) {
        return outThis.event.subscribe(outThis.fixedEventType.sendHeartBeat, callback)
      },
      onClose (callback) {
        return outThis.event.subscribe(outThis.fixedEventType.closeHeartBeat, callback)
      },
      start () {
        clearTimeout(this.config.pollingIntervalId)
        clearTimeout(this.config.maxTimeoutId)
        this.config.time = new Date().getTime() + this.config.pollingInterval
        this.config.pollingIntervalId = setTimeout(() => {
          outThis.emit('J_Socket_Heartbeat', {})
          ++this.config.count
          outThis.event.publish(outThis.fixedEventType.sendHeartBeat, this.config.count, new Date().getTime() - this.config.time)
          this.config.maxTimeoutId = setTimeout(() => {
            outThis.close()
            outThis.event.publish(outThis.fixedEventType.closeHeartBeat)
          }, this.config.maxTimeout)
        }, this.config.pollingInterval)
      }

    }
    this.on('J_Socket_Heartbeat', heartbeat.start.bind(heartbeat))

    return heartbeat
  }

  executePromiseChain (data, initCallback, type = 1) {
    let promise = Promise.resolve(data)
    const chain = [initCallback, undefined]
    const Handles = this.interceptors[type === 1 ? 'response' : 'request'].handle
    for (let i = Handles.length - 1; i >= 0; i--) {
      chain.unshift(Handles[i].resolve, Handles[i].reject)
    }
    while (chain.length) {
      promise = promise.then(chain.shift(), chain.shift())
    }
  }

  connect (callback) {
    return this.event.subscribe(this.fixedEventType.connect, callback)
  }

  disconnect (callback) {
    return this.event.subscribe(this.fixedEventType.disconnect, callback)
  }

  error (callback) {
    return this.event.subscribe(this.fixedEventType.error, callback)
  }

  on (type, callback) {
    // 可以检验一下 有没有重复
    return this.event.subscribe(type, callback)
  }

  emit (type, data = {}) {
    this.sendAdapter(type, data)
  }

  request (type, data = {}) {
    this.sendAdapter(type, data)
    return new Promise((resolve) => {
      this.event.subscribeOnce(type, resolve)
    })
  }

  sendAdapter (type, data = {}) {
    if (typeof type !== 'string') {
      throw new Error('第一个参数必须为string')
    }
    // 发送请求前 先要判断ws 是否已连接 如果没连接 先要放在数组内进行临时报错
    if (this.connected) {
      this.executePromiseChain(data, (data) => this.ws.send(JSON.stringify({
        type,
        data
      })), 2)
    } else {
      this.temporaryStorageRequestStack.push(() => this.executePromiseChain(data, (data) => this.ws.send(JSON.stringify({
        type,
        data
      })), 2))
    }
  }

  close () {
    // this.callbackStack.on = {}
    this.connected = false
    this.ws.close && this.ws.close()
  }

  reconnect () {
    this.close()

    const reconnect = () => {
      this.ws = new WebSocket(this.url)
      this.init()
    }
    reconnect()
    // 两秒重连一次
    const id = setInterval(() => {
      if (this.connected) {
        clearInterval(id)
      } else {
        reconnect()
      }
    }, 2000)
  }
}

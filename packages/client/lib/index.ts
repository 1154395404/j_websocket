import J_EventBus from './J_EventBus'
import J_InterceptorManager from './J_InterceptorManager'

// 定义 FixedEventType 类型用于固定的事件名称
interface FixedEventType {
  connect: string
  disconnect: string
  close: string
  error: string
  sendHeartBeat: string
  closeHeartBeat: string
}

// 定义 initCallback 类型为一个接收任意参数并返回任意类型的函数
type InitCallback = (...args: any[]) => any

// 定义心跳配置接口
interface HeartbeatConfig {
  count: number
  pollingInterval: number
  maxTimeout: number
  pollingIntervalId: number
  maxTimeoutId: number
  time: number
}

// 定义心跳处理接口
interface HeartbeatHandler {
  config: HeartbeatConfig
  setConfig: (pollingInterval: number, maxTimeout: number) => void
  onSendHeartBeat: (callback: (...args: any[]) => void) => void
  onClose: (callback: (...args: any[]) => void) => void
  start: () => void
}

class J_Websocket {
  private url: string
  private ws: WebSocket
  public event: J_EventBus
  private interceptors: {
    request: J_InterceptorManager
    response: J_InterceptorManager
  }
  private temporaryStorageRequestStack: Array<() => void>
  private randomPrefix: string
  private fixedEventType: FixedEventType
  public connected: boolean
  private heartbeat: HeartbeatHandler

  constructor(url: string) {
    this.url = url
    this.ws = new WebSocket(url)
    this.event = new J_EventBus()
    this.temporaryStorageRequestStack = []
    this.interceptors = {
      request: new J_InterceptorManager(),
      response: new J_InterceptorManager(),
    }
    this.randomPrefix = parseInt(Math.random() * 100 + '') + '_J_Websocket_'
    this.fixedEventType = {
      connect: this.randomPrefix + 'connect',
      disconnect: this.randomPrefix + 'disconnect',
      close: this.randomPrefix + 'close',
      error: this.randomPrefix + 'error',
      sendHeartBeat: this.randomPrefix + 'sendHeartBeat',
      closeHeartBeat: this.randomPrefix + 'closeHeartBeat',
    }
    this.connected = false
    this.heartbeat = this.heartbeatInit()
    this.init()
  }

  private init(): void {
    this.ws.onopen = () => {
      this.connected = true
      this.heartbeat.start()
      this.event.publish(this.fixedEventType.connect)
      while (this.temporaryStorageRequestStack.length) {
        const task = this.temporaryStorageRequestStack.shift()
        if (task) {
          task()
        }
      }
    }

    this.ws.onmessage = (event: MessageEvent) => {
      const { type, data: responseData } = JSON.parse(event.data)
      this.event.publishByInterceptor(
        this.executePromiseChain.bind(this),
        type,
        responseData,
      )
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

  private heartbeatInit(): HeartbeatHandler {
    const outThis = this
    const heartbeat: HeartbeatHandler = {
      config: {
        count: 0,
        pollingInterval: 1000 * 60 * 60, // 1 hour
        maxTimeout: 1000 * 60 * 60, // 1 hour
        pollingIntervalId: -1,
        maxTimeoutId: -1,
        time: -1,
      },
      setConfig(pollingInterval: number, maxTimeout: number): void {
        this.config.pollingInterval = pollingInterval
        this.config.maxTimeout = maxTimeout
      },
      onSendHeartBeat(
        callback: (...args: any[]) => void,
      ): ReturnType<J_EventBus['subscribe']> {
        return outThis.event.subscribe(
          outThis.fixedEventType.sendHeartBeat,
          callback,
        )
      },
      onClose(
        callback: (...args: any[]) => void,
      ): ReturnType<J_EventBus['subscribe']> {
        return outThis.event.subscribe(
          outThis.fixedEventType.closeHeartBeat,
          callback,
        )
      },
      start(): void {
        clearTimeout(this.config.pollingIntervalId)
        clearTimeout(this.config.maxTimeoutId)
        this.config.time = new Date().getTime() + this.config.pollingInterval
        this.config.pollingIntervalId = window.setTimeout(() => {
          outThis.emit('J_Socket_Heartbeat', {})
          ++this.config.count
          outThis.event.publish(
            outThis.fixedEventType.sendHeartBeat,
            this.config.count,
            new Date().getTime() - this.config.time,
          )
          this.config.maxTimeoutId = window.setTimeout(() => {
            outThis.close()
            outThis.event.publish(outThis.fixedEventType.closeHeartBeat)
          }, this.config.maxTimeout)
        }, this.config.pollingInterval)
      },
    }
    this.on('J_Socket_Heartbeat', heartbeat.start.bind(heartbeat))
    return heartbeat
  }

  private executePromiseChain(
    data: any,
    initCallback: InitCallback,
    type: 'request' | 'response' = 'response',
  ): void {
    let promise: Promise<any> = Promise.resolve(data)
    const chain: Array<undefined | InitCallback> = [initCallback, undefined]
    const handlers = this.interceptors[type].getHandlers()

    for (let i = handlers.length - 1; i >= 0; i--) {
      const { resolve, reject } = handlers[i]
      chain.unshift(resolve, reject)
    }

    while (chain.length) {
      promise = promise.then(chain.shift()!, chain.shift())
    }
  }

  public connect(callback: (...args: any[]) => void) {
    return this.event.subscribe(this.fixedEventType.connect, callback)
  }

  public disconnect(callback: (...args: any[]) => void) {
    return this.event.subscribe(this.fixedEventType.disconnect, callback)
  }

  public error(callback: (...args: any[]) => void) {
    return this.event.subscribe(this.fixedEventType.error, callback)
  }

  public on(type: string, callback: (...args: any[]) => void) {
    // Potential check for duplicates could be added here
    return this.event.subscribe(type, callback)
  }

  public emit(type: string, data: Record<string, any> = {}): void {
    this.sendAdapter(type, data)
  }

  public request(type: string, data: Record<string, any> = {}): Promise<any> {
    this.sendAdapter(type, data)
    return new Promise((resolve) => {
      this.event.subscribeOnce(type, resolve)
    })
  }

  private sendAdapter(type: string, data: Record<string, any> = {}): void {
    if (typeof type !== 'string') {
      throw new Error('第一个参数必须为string')
    }

    if (this.connected) {
      this.executePromiseChain(
        data,
        (data: any) => {
          this.ws.send(JSON.stringify({ type, data }))
        },
        'request',
      )
    } else {
      this.temporaryStorageRequestStack.push(() =>
        this.executePromiseChain(
          data,
          (data: any) => {
            this.ws.send(JSON.stringify({ type, data }))
          },
          'request',
        ),
      )
    }
  }

  public close(): void {
    // this.callbackStack = {};
    this.connected = false
    if (this.ws) {
      this.ws.close()
    }
  }

  public reconnect(): void {
    this.close()
    const reconnect = (): void => {
      this.ws = new WebSocket(this.url)
      this.init()
    }
    reconnect()

    // Two second reconnect interval
    const id = setInterval(() => {
      if (this.connected) {
        clearInterval(id)
      } else {
        reconnect()
      }
    }, 2000)
  }
}

export default J_Websocket

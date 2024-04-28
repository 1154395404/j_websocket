import WebSocket, { WebSocketServer } from 'ws'
/**
 * @function
 * @name respondFunction
 * @param data {object}向前端发出的数据
 * */
/**
 * @function
 * @name broadcastFunction
 * @param type {string}向前端相应的事件类型
 * @param data {object}向前端发出的数据
 * */
/**
 * @function
 * @name emitFunction
 * @param type {string}向前端相应的事件类型
 * @param data {object}向前端发出的数据
 * */

/**
 * @callback onCallback
 * @param {Object}  data 前端传递的数据
 * @param {Object} options  一些属性和方法
 * @param {Object} options.ws  当前用户ws对象
 * @param {Object} options.wss  所有在线ws对象
 * @param {respondFunction} options.respond  向当前前端返回数据方法
 * @param {broadcastFunction} options.broadcast  广播数据：除了自己其他在线用户都能收到
 * @param {emitFunction} options.emit  向所有在线用户发送数据
 * */

/**
 * @callback commonCallback
 * @param {Object} options  一些属性和方法
 * @param {Object} options.ws  当前用户ws对象
 * @param {Object} options.wss  所有在线ws对象
 * @param {respondFunction} options.respond  向当前前端返回数据方法
 * @param {broadcastFunction} options.broadcast  广播数据：除了自己其他在线用户都能收到
 * @param {emitFunction} options.emit  向所有在线用户发送数据
 * */
/**
 * @callback useCallback
 * @param data {Object} 前端传递来的数据
 * @param {Object} options  一些属性和方法
 * @param {Object} options.ws  当前用户ws对象
 * @param {Object} options.wss  所有在线ws对象
 * @param {respondFunction} options.respond  向当前前端返回数据方法
 * @param {broadcastFunction} options.broadcast  广播数据：除了自己其他在线用户都能收到
 * @param {emitFunction} options.emit  向所有在线用户发送数据
 * @param next {function}  调用此函数 会进入请求响应函数on 否则永远不会执行响应on函数
 * */

// 定义回调函数类型
type RespondFunction<T> = (data: T) => void
type BroadcastFunction<T> = (type: string, data: T) => void
type EmitFunction<T> = (type: string, data: T) => void

interface CallbackCommonOptions<T> {
  ws: WebSocket
  wss: WebSocketServer
  currentClients: Set<WebSocket>
  responding: (type: string) => RespondFunction<T>
  broadcast: BroadcastFunction<T>
  emit: EmitFunction<T>
}

interface OnConnectCallbackOptions<T> extends CallbackCommonOptions<T> {
  data: T
  respond: RespondFunction<T>
}

type OnCallback<T> = (data: T, options: OnConnectCallbackOptions<T>) => void
type CommonCallback<T> = (options: CallbackCommonOptions<T>) => void
type UseCallback<T> = (
  data: T,
  options: CallbackCommonOptions<T>,
  next: (value: unknown) => void,
) => void

interface CallbackStack<T> {
  connect: CommonCallback<T>
  disconnect: CommonCallback<T>
  on: Record<string, OnCallback<T>>
  use: UseCallback<T>[]
}

class J_Websocket {
  private wss: WebSocketServer | null
  private currentClients: WebSocketServer['clients'] | null
  private callbackStack: CallbackStack<any>
  constructor() {
    this.wss = null
    this.currentClients = null
    this.callbackStack = {
      connect: () => {},
      disconnect: () => {},
      // 响应函数
      on: {},
      //中间件函数
      use: [],
    }
  }

  public listen(port: number, callback?: (port: number) => void): void {
    this.wss = new WebSocketServer({ port })
    this.currentClients = this.wss.clients
    this.init()
    callback && callback(port)
  }

  private init() {
    this.wss?.on('connection', async (ws: WebSocket) => {
      const options = this.createOptions(ws)
      // await Promise.all(this.#callbackStack.use.map((cb) => new Promise((resolve) => cb(options, resolve))))
      this.callbackStack.connect(options)
      ws.on('message', async (message: string) => {
        const { type, data } = JSON.parse(message)
        const onConnectCallbackOptions: OnConnectCallbackOptions<typeof data> =
          {
            ...options,
            data,
            respond: options.responding(type),
          }

        try {
          await Promise.all(
            this.callbackStack.use.map(
              (cb: UseCallback<typeof data>) =>
                new Promise((resolve) =>
                  cb(data, onConnectCallbackOptions, resolve),
                ),
            ),
          )
          this.callbackStack.on[type](data, onConnectCallbackOptions)
        } catch (e) {
          console.error(e)
        }
      })
      ws.on('close', () => {
        this.callbackStack.disconnect(options)
      })
    })
    this.on('J_Socket_Heartbeat', (_, { respond }) => {
      respond({ date: new Date() })
    })
  }

  private createOptions<T>(ws: WebSocket): CallbackCommonOptions<T> {
    return {
      responding: (type: string) => {
        return (data: T) => {
          this.beforeSendAdapter(type, data, 'respond', ws)
        }
      },
      broadcast: (type: string, data: T) => {
        this.beforeSendAdapter(type, data, 'broadcast', ws)
      },
      emit: (type: string, data: T) => {
        this.beforeSendAdapter(type, data, 'emit', ws)
      },
      ws,
      wss: this.wss!,
      currentClients: this.currentClients!,
    }
  }

  /**
   * @description 当用户初次连接后调用里面的回调函数
   * @param callback {commonCallback}  处理用户初次连接的回调函数
   * */
  connect<T>(callback: CommonCallback<T>) {
    this.callbackStack.connect = callback
  }

  /**
   * @description 当用户掉线后调用里面的回调函数
   * @param callback {commonCallback}  处理用户离线的回调函数
   * */
  disconnect<T>(callback: CommonCallback<T>) {
    this.callbackStack.disconnect = callback
  }

  /**
   * @description 响应前端ws请求
   * @param type {string} 响应ws请求事件名称
   * @param callback {onCallback} 响应事件的回调函数
   * */
  on<T>(type: string, callback: OnCallback<T>) {
    if (typeof type !== 'string') throw new Error('第一个参数必须为string')
    this.callbackStack.on[type] = callback
  }

  /**
   * @description 向所有在线用户发送数据
   * @param type {string}  发送ws请求事件名称
   * @param data {object} 发送的数据
   * @param to {Array} [this.currentClients] 向那个ws实力发送数据 默认全发送
   * */
  emit<T>(type: string, data: T) {
    this.beforeSendAdapter<T>(type, data, 'emit')
  }

  private beforeSendAdapter<T>(
    type: string,
    data: T,
    mode = 'broadcast',
    ws?: WebSocket,
  ) {
    if (typeof type !== 'string') throw new Error('第一个参数必须为string')
    switch (mode) {
      case 'broadcast':
        this.wss?.clients.forEach((client) => {
          if (client !== ws && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type, data }))
          }
        })
        break
      case 'emit':
        this.wss?.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type, data }))
          }
        })
        break
      case 'respond':
        ws?.send(JSON.stringify({ type, data }))
        break
    }
  }

  /**
   * @description 中间件函数
   * @param callback {useCallback}  用于处理响应请求前的一些任务
   * */
  use<T>(callback: UseCallback<T>) {
    this.callbackStack.use.push(callback)
  }
}

export default J_Websocket

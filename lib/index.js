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
module.exports=class J_Socket {
    #callbackStack = {}

    constructor(ws) {
        // this.port = port
        this.WebSocket = ws;
        this.WebSocketServer = {}
        this.wss = {}
        this.currentClients = {}
        this.#callbackStack = {
            connect: () => {
            },
            disconnect: () => {
            },
            // 响应函数
            on: {},
            //中间件函数
            use: []
        }

    }

    listen(port, callback) {
        this.WebSocketServer = this.WebSocket.WebSocketServer
        this.wss = new this.WebSocketServer({port});
        this.currentClients = this.wss.clients
        this.#init()
        callback && callback(port)
    }

    #init() {
        this.wss.on('connection', async (ws) => {
            const options = this.#createOptions(ws)
            // await Promise.all(this.#callbackStack.use.map((cb) => new Promise((resolve) => cb(options, resolve))))
            this.#callbackStack.connect(options)
            ws.on('message', async (message, isBinary) => {
                const {type, data} = JSON.parse(message)
                options.respond = options.responding(type)
                options.data = data
                try {
                    await Promise.all(this.#callbackStack.use.map((cb) => new Promise((resolve) => cb(data, options, resolve))))
                    this.#callbackStack.on[type](data, options)
                } catch (e) {

                }
            });
            ws.on('close', () => {
                this.#callbackStack.disconnect(options)
            })
        });
        this.on('J_Socket_Heartbeat',(data,{respond})=>{
            respond({date:new Date()})
        })
    }

    #createOptions(ws) {
        return {
            responding: (type) => {
                return (data) => {
                    this.beforeSendAdapter(type, data, 'respond', ws)
                }
            },
            broadcast: (type, data) => {
                this.beforeSendAdapter(type, data, 'broadcast', ws)
            },
            emit: (type, data) => {
                this.beforeSendAdapter(type, data, 'emit', ws)
            },
            ws,
            wss: this.wss,
            currentClients: this.currentClients
        }
    }

    /**
     * @description 当用户初次连接后调用里面的回调函数
     * @param callback {commonCallback}  处理用户初次连接的回调函数
     * */
    connect(callback) {
        this.#callbackStack.connect = callback
    }

    /**
     * @description 当用户掉线后调用里面的回调函数
     * @param callback {commonCallback}  处理用户离线的回调函数
     * */
    disconnect(callback) {
        this.#callbackStack.disconnect = callback
    }


    /**
     * @description 响应前端ws请求
     * @param type {string} 响应ws请求事件名称
     * @param callback {onCallback} 响应事件的回调函数
     * */
    on(type, callback) {
        if (typeof type !== 'string')
            throw new Error('第一个参数必须为string')

        // if (this.#callbackStack.on[type])
        //     console.error(('type 已被占用请更换'))
        // else
        this.#callbackStack.on[type] = callback
    }

    /**
     * @description 向所有在线用户发送数据
     * @param type {string}  发送ws请求事件名称
     * @param data {object} 发送的数据
     * @param to {Array} [this.currentClients] 向那个ws实力发送数据 默认全发送
     * */
    emit(type, data) {
        this.beforeSendAdapter(type, data, 'emit')
    }

    beforeSendAdapter(type, data, mode = 'broadcast', ws) {
        if (typeof type !== 'string')
            throw new Error('第一个参数必须为string')
        switch (mode) {
            case 'broadcast':
                this.wss.clients.forEach((client) => {
                    if (client !== ws && client.readyState === this.WebSocket.OPEN) {
                        client.send(JSON.stringify({type, data}))
                    }
                });
                break;
            case 'emit':
                this.wss.clients.forEach((client) => {
                    if (client.readyState === this.WebSocket.OPEN) {
                        client.send(JSON.stringify({type, data}))
                    }
                });
                break;
            case 'respond':
                ws.send(JSON.stringify({type, data}))
                break;

        }
    }

    /**
     * @description 中间件函数
     * @param callback {useCallback}  用于处理响应请求前的一些任务
     * */
    use(callback) {
        this.#callbackStack.use.push(callback)
    }
}


/**
 socket.use((options, next) => {
    options.user = {name: 'zj', age: 18}
   setTimeout(()=>{
       console.log('use1')
       next()
   },1000)
})

 socket.use((options, next) => {

      console.log('use2')
      next()

})
 // socket.use(() => {
//     console.log('use2')
//
// })

 socket.connect(({wss}) => {
    console.log(wss.clients.size)
    console.log('connect')
})

 socket.disconnect(({wss, ws}) => {
    console.log('disconnect', wss.clients.size)
    console.log('disconnect')
})

 socket.on('test', (data, {respond, broadcast}) => {
    console.log('test', data)

    respond({
        msg: 'from server111',
        date: new Date()
    })

    broadcast('testBroadcast', {
        msg: 'from server Broadcast 除了我能收到',
        date: new Date()
    })
})
 socket.on('req', (data, {respond, broadcast, user}) => {
    console.log('req', data)

    respond({
        user: user,
        msg: 'req from server',
        date: new Date()
    })
})
 socket.on('xxx', (data, options) => {

    options.respond({})


})

 setInterval(()=>{
    socket.emit('testBroadcast',{
        msg:'都能收到',
        date:new Date()
    })
},1000)
 */


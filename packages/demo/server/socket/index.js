// const ws = require('ws')
// const Socket = require('j_websocket')
const Socket = require('j_websocket/server')
const jwt_socket = require("../middleware/jwt_socket");
const socket = new Socket()
socket.use(jwt_socket)
socket.connect(() => {
    console.log('有用户加入了连接')
})
// 响应用户在线
socket.on('online', require('./on/online'))
// 获取聊天列表
socket.on('getChatList', require('./on/getChatList'))
// 响应私聊
socket.on('privateChat', require('./on/privateChat'))
// 响应群发
socket.on('groupChat', require('./on/groupChat'))
// 把未读消息 置0
socket.on('setNotReadMessageZero', require('./on/setNotReadMessageZero'))
// 用户断联
socket.disconnect(require('./on/disconnect'))
socket.listen(4444, (port) => {
    console.log('websocket 服务启动成功 端口 ' + port)
})

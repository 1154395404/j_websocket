# J_Websocket
一款可以让你快速开发websocket及时通讯功能的前后端服务库

[>>>Github<<<](https://github.com/1154395404/j_socket)
## 目录

* [特性](#特性)
* [安装](#安装)
* [API](#api用法)
    * [浏览器环境]()
        * [实例化](#实例化_b)
        * [监听websocket是否成功连接](#监听websocket是否成功连接)
        * [监听websocket是否连接失败](#监听websocket是否连接失败)
        * [监听websocket是否断联](#监听websocket是否断联)
        * [向后端发送消息](#向后端发送消息)
        * [向后端发送请求 类似于http请求](#向后端发送请求-类似于http请求)
        * [监听发送来的Node消息](#监听发送来的node消息)
        * [请求拦截器](#请求拦截器)
        * [响应拦截器](#响应拦截器)
        * [心跳监听](#心跳监听)
        * [断开连接](#断开连接)
        * [重新连接](#重新连接)
    * [Node环境]()
      * [实例化](#实例化_c)
      * [开启websocket服务](#开启websocket服务)
      * [use中间件](#use中间件)
      * [有用户加入了连接](#有用户加入了连接)
      * [监听前端发来的消息](#监听前端发来的消息)
      * [全局广播](#全局广播)
      * [断开连接](#断开连接)
* [案例](#案例)
  * [构建一个基础的websocket服务](#构建一个基础的websocket服务)
  * [发送与响应一个 类似http请求响应的 websocket消息](#发送与响应一个-类似http请求响应的-websocket消息)
  * [利用拦截器 与 中间件 实现一个 jwt 用户鉴权](#利用拦截器-与-中间件-实现一个-jwt-用户鉴权)
* [实战](#实战)

## 特性
### 浏览器环境
* 使用**事件监听方式** 监听不同类型 响应的websocket消息
* 封装了 类似 axios 的**请求和响应拦截器**
* 封装了 **心跳响检测** 方法
* 封装了 **重连、Promise请求**等等一些实用的方法
### Node环境
* 使用**事件监听方式** 监听不同类型 请求的websocket消息
* 封装了 类似 express 的**中间件**方法 
* 封装了 **广播、全员广播、点对点响应**的方法 
## 安装
### 浏览器环境
#### 使用npm方式
```shell
npm install j_websocket
```
#### script 引入
```html
<!--下载./lib/j_socket_front.js 文件-->
<script src="./lib/j_socket_front.js"></script>
```


### Node环境
#### 使用nmp方式
```shell
npm install j_websocket
```


## API用法
### 浏览器环境
#### 实例化_b
```javascript
// npm 方式
import Socket from 'j_websocket'
const socket = new Socket('http://127.0.0.1')// Node后端监听的ip地址
// script 引入
const socket = new J_Websocket('http://127.0.0.1')
```
####  监听websocket是否成功连接 
```javascript
const unsubscribeConnect = socket.connect(() => {
    console.log('websocket 成功连接调用此回调函数')
})

unsubscribeConnect()// 调用此函数 会取消消息订阅  故以后不会调用此回调函数
```
#### 监听websocket是否连接失败
```javascript
const unsubscribeError = socket.error(() => {
    console.log('websocket 连接失败时调用此回调函数')
})
unsubscribeError()// 调用此函数 会取消消息订阅  故以后不会调用此回调函数
```
#### 监听websocket是否断联
```javascript
const unsubscribeDisconnect = socket.disconnect(() => {
    console.log('websocket 连接断开时调用此回调函数')
})
unsubscribeDisconnect()// 调用此函数 会取消消息订阅  故以后不会调用此回调函数
```
#### 向后端发送消息
```javascript
socket.emit('testMessageType', {
    age:18,
    name:'青栀'
})
// 当Node订阅 testMessageType 事件时 会得到该请求参数
```
#### 向后端发送请求 类似于http请求
```javascript
socket.request('testMessageRequestType', {
    age:18,
    name:'青栀'
}).then((data)=>{
    console.log(data)
})
// 当Node订阅 testMessageRequestType 事件时 会得到该请求参数 并调用.respond方法会得到响应数据
// 详细用法见案例
```
#### 监听发送来的Node消息
```javascript
const unsubscribeTestOnNodeTypeMessage=socket.on('testOnNodeTypeMessage',(data)=>{
    console.log('Node 发送的消息:',data)
})
//unsubscribeTestOnNodeTypeMessage()// 调用此函数 会取消消息订阅  故以后不会调用此回调函数
// 当后端发送 testOnNodeTypeMessage 类型消息 时会触发此回调函数
// 详细用法见案例
```
#### 请求拦截器
```javascript
socket.interceptors.request.use((data) => {
    // 每次发起请求会调用此函数
    console.log('interceptors request resolve 1')
  return data
}, (error) => {
    console.log('interceptors request reject 1')
  return Promise.reject(error)
})

socket.interceptors.request.use((data) => {
    // 每次发起请求会调用此函数
    console.log('interceptors request resolve 2')
  return data
}, (error) => {
    console.log('interceptors request reject 2')
  return Promise.reject(error)
})
/** 当时用 socket.emit('type',{age:18}) 和 socket.request('type', {name:'青栀'}) Api
    向后端  发送消息请求时会 触发请求拦截器
    用法 与axios拦截器相似 不过这里需要返回的是data 就是你向后端请求时携带的参数
 */
```
#### 响应拦截器
```javascript
socket.interceptors.response.use((data) => {
    //每当有 数据响应返回时 会调用此函数
    console.log('interceptors response resolve 1')
  return data
}, (error) => {
    console.log('interceptors response reject 1')
  return Promise.reject(error)
})

socket.interceptors.response.use((data) => {
    //每当有 数据响应返回时 会调用此函数
    console.log('interceptors response resolve 2')
  return data
}, (error) => {
    console.log('interceptors response reject 2')
  return Promise.reject(error)
})

```
#### 心跳监听
```javascript
// 心跳监听是 即时通讯项目 来保证项目websocket连接稳定性的一种思想
// 所以 j_websocket 也封装了心跳监听 使开发更加高效

// 配置心跳监听时间   入参1：多少毫秒进行一次心跳监听  入参2 多少毫秒后没有响应后 会判定连接断开
socket.heartbeat.setConfig(5000, 3000)

// 每次发送心跳测试时 会触发里面的回调函数
const unsubscribeSendHeartBeat=socket.heartbeat.onSendHeartBeat((count, delay) => {
    console.log(`第${count}次心跳检测❤--延时${delay}ms`)
})
// 调用此函数 可取消订阅
unsubscribeSendHeartBeat()

// 当心跳连接判定断开时 会调用此回调函数
const unsubscribeHeartBeatClose=socket.heartbeat.onClose(() => {
    console.log('断开连接了')
})
// 调用此函数 可取消订阅
unsubscribeHeartBeatClose()
```
#### 断开连接
```javascript
// 调用此函数时 会断开websocket连接 如果你监听了 disconnect事件 和 心跳断联 都会触发里面的回调函数
socket.close() 
```
#### 重新连接
```javascript
// 断开上一次websocket连接 重新连接一个新websocket服务
socket.reconnect() 
```
### Node环境
#### 实例化_c
```javascript
const ws = require('ws') //引入原生ws 模块
const Socket = require('j_websocket')// 引入j_webocket 模块
const socket = new Socket(ws)
```
#### 开启websocket服务
```javascript
// 调用listen 方法即可开启监听
socket.listen(80, (port) => {
    console.log('websocket 服务启动成功 端口 ' + port)
})
```
#### use中间件
```javascript
socket.use((data, options, next) => {
    // data 前端发送消息时携带的参数
    /**
     * options 选项对象
     * {
        ws 当前用户ws对象  ws模块原生对象
        wss  所有在线用户ws对象  ws模块原生对象
        respond  向当前前端响应数据方法
        broadcast  广播数据除了自己其他在线用户都能收到
        emit  向所有在线用户发送数据
     * }
     * */
    // next() 调用next函数会进入下一个中间件 或者 进入websocket 消息监听
})
```
#### 有用户加入了连接
```javascript
//  options 见use中间说明
socket.connect((options) => {
    console.log('有用户加入了连接')
})
```
#### 监听前端发来的消息
```javascript
//  options 见use中间说明
socket.on('exampleType1', (data, options)=>{
    console.log('前端发来的消息',data)
    
    // 你可以像前端响应消息
    // 1.广播
    options.broadcast('example1',{name:'青栀'})
    //2. 全员广播
    options.emit('example1',{name:'青栀'})
    // 更多详细用法 见案例
})
```
#### 全局广播
```javascript
setInterval(()=>{
    // 每3秒像前端广播一次消息 与options.emit 作用一样 只不过这个方法挂在在 J_Websocket 原型上
    socket.emit('example1',{name:'青栀'})
},3000)
```
#### 断开连接
```javascript
//  options 见use中间说明
socket.disconnect((options)=>{
    console.log('有用户断开了连接')
})
```
## 案例
### 构建一个基础的websocket服务
前端
```javascript
import Socket from 'j_websocket'
const socket = new Socket('http://127.0.0.1')
const subscribeonOnline=socket.on('onOnline',(data)=>{
    // data {msg:'后端收到了 青栀上线 的请求'}
})
socket.emit('online',{msg:'我 青栀 上线啦'})
```
后端
```javascript
const ws = require('ws')
const Socket = require('j_websocket')
const socket = new Socket(ws)
socket.on('online',(data, options)=>{
    // data {msg:'我 青栀 上线啦'}
    options.emit('onOnline',{msg:'后端收到了 青栀上线 的请求'})
})
socket.listen(80, (port) => {
    console.log('websocket 服务启动成功 端口 ' + port)
})
```
### 发送与响应一个 类似http请求响应的 websocket消息
前端
```javascript
socket.request('getList', { id: 1 }).then((data)=>{
    //data {msg:'id 为1 的用户列表',userList:[1,2,3]}
    console.log(data)
})
```
后端
```javascript
socket.on('getList',(data, options)=>{
    // data { id: 1 }
    options.respond('onOnline',{msg:'id 为1 的用户列表',userList:[1,2,3]})
})
```
### 利用拦截器 与 中间件 实现一个 jwt 用户鉴权
前端 
```javascript
//socket.js
import Socket from 'j_websocket'
import store from '@/store'
import router from '@/router'
const socket = new Socket('http://127.0.0.1')

socket.interceptors.request.use((data) => {
    // 请求拦截器 发送请求前会 携带 用户token
  data.authorization = `Bearer ${store.state.token}`
  return data
}, (e) => {
  return Promise.reject(e)
})

socket.interceptors.response.use((data) => {
    // 前端拦截 是否 data.code === 401 如果是代表jwt过期
  if (data && data.code === 401 && router.currentRoute.path !== '/login') {
      router.push('/login')
      console.log('token 过期啦')
  }
  return data
}, (e) => {
  return Promise.reject(e)
})
export default socket

```
后端
```javascript
//jwt.js
const jwt = require('jsonwebtoken');
const secret = 'qingzhi';
module.exports = {
    sign(data) {
        return jwt.sign(data, secret, {expiresIn: '1h'});
    },
    verify(token) {
        try {
            return jwt.verify(token, secret)
        } catch (e) {
            return null
        }
    }
}
// socket.js
const ws = require('ws')
const Socket = require('j_websocket')
const socket = new Socket(ws)
const jwt = require('jwt.js')
socket.use((data, options, next) => {
    const token = data.authorization?.split(' ')[1]
    const user = jwt.verify(token) 
    if (user) {
        delete data.authorization
        options.user = user //为当前用户挂载 user属性 以后的中间件可直接拿到用户信息
        next()
    } else {
        // jwt 校验失败时 会直接向当前用户返回错误信息
        options.respond({
            message: 'token 校验失败',
            code:401,
            status: 0
        })
    }
})
// 响应用户在线
socket.on('online', (data, options)=>{
    // 拦截器通过后 这里可直接拿到用户信息
    options.user //{id:1,name:'青栀',age:18}
})

socket.listen(80, (port) => {
    console.log('websocket 服务启动成功 端口 ' + port)
})
```

## 实战
### 在线聊天室项目
### [线上项目](http://www.xiaojunplay.cn/j_chat)
### 项目介绍
一款类似微信聊天的 在线聊天项目

代码在 example 文件夹里

### 前端
#### 运行
```shell
npm run serve
```
#### 技术栈
Vue2、axios、j_websocket、element-ui、vuex、animate.css
#### 技术要点
* axios 使用封装
* J_Websocket 使用与封装
* Flip 动画思想
* 断线重连
* 对于各种文件的 发送 与 解析
* 前端 用户鉴权封装
* 图片视频数据懒加载
### 后端
#### 运行
```shell
npm run start
```
#### 技术栈
Node、Express、axios、j_websocket、json-server、jwt
#### 技术要点
* axios 封装
* service层 对 json-server 的分层
* j_websocket 封装
* 各种中间件封装
### 截图
![alt 截图](https://web-1301368439.cos.ap-beijing.myqcloud.com/projectCover/20230131-175542.gif)
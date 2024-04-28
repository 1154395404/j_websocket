
// import Socket from 'j_websocket'
import Socket from 'j_websocket/client'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'
console.log(Socket)

const socket = new Socket(process.env.VUE_APP_WEBSOCKET_URL)

socket.interceptors.request.use((data) => {
  data.authorization = `Bearer ${store.state.token}`
  return data
}, (e) => {
  return Promise.reject(e)
})

socket.interceptors.response.use((data) => {
  if (data && data.code === 401 && router.currentRoute.path !== '/login' && router.currentRoute.path !== '/register') {
    router.push('/login')
    Message.error('token 过期啦')
  }
  return data
}, (e) => {
  return Promise.reject(e)
})

socket.heartbeat.setConfig(5000, 3000)
socket.heartbeat.onSendHeartBeat((count, delay) => {
  console.log(`第${count}次心跳检测%c❤%c--延时%c${delay}ms`, 'color:red;', 'color:black', 'color:green;')
})
socket.heartbeat.onClose(() => {
  console.log('断开连接了')
})

export default socket

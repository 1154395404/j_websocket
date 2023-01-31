// export const emit = (key, payload) => {
//   localStorage.setItem(`xtx_${key}`, JSON.stringify({
//     date: Date.now(),
//     payload
//   }))
// }
// export const on = (key, callback) => {
//   window.addEventListener('storage', (e) => {
//     console.log(e)
//     callback(e)
//   })
// }

class Event {
  constructor () {
    this.handler = {}
  }

  emit (key, payload) {
    if (this.handler[key]) { this.handler[key](payload) } else { console.error(`此key:${key}没有被订阅 消息发生失败`) }
  }

  on (key, callback) {
    this.handler[key] = callback
  }
}

export default new Event()

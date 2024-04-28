export default {
  get (key) {
    return JSON.parse(localStorage.getItem(key.toString()))
  },
  set (key, data) {
    return localStorage.setItem(key.toString(), JSON.stringify(data))
  }
}

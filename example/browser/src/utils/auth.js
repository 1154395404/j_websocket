import storage from '@/utils/storage'
import store from '@/store'
const key = 'chatRoom_token'
export default {
  set (token) {
    store.commit('setToken', token)
    return storage.set(key, token)
  },
  get () {
    return storage.get(key) || ''
  }
}

import axios from 'axios'
import store from '@/store'
import router from '@/router'
import { Message } from 'element-ui'

// const baseURL = 'http://127.0.0.1:3000/api'
const baseURL = process.env.VUE_APP_SERVER_URL + '/api'
const newAxiosInstance = axios.create({
  baseURL,
  timeout: 5000
})

newAxiosInstance.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${store.state.token}`
  return config
}, (e) => {
  return Promise.reject(e)
})
newAxiosInstance.interceptors.response.use((response) => {
  return response.data
}, (error) => {
  if (error.response && error.response.status === 401 && router.currentRoute.path !== '/login') {
    router.push('/login')
  }
  Message.error(error.response.data?.message)

  return Promise.reject(error)
})

/**
 * @param url {string} 请求地址
 * @param method {string} 请求方法
 * @param data {object} 携带参数
 * */
export default (url, method = 'get', data = {}) => {
  return newAxiosInstance({
    url,
    method,
    [method.toLowerCase() === 'get' ? 'params' : 'data']: data
  })
}

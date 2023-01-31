const axios = require('axios')
const baseURL = 'http://127.0.0.1:3333'
const newAxiosInstance = axios.create({
    baseURL,
    timeout: 5000
})

/**
 * @param url {string} 请求地址
 * @param method {string} 请求方法
 * @param data {object} 携带参数
 * */
newAxiosInstance.interceptors.response.use((response)=>{
    return response.data
},(e)=>{
    return Promise.reject(e)
})

module.exports = (url, method='get', data={}) => {
    return newAxiosInstance({
        url,
        method,
        [method.toLowerCase() === 'get' ? 'params' : 'data']: data
    })
}

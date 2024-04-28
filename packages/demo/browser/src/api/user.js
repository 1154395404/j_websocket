import request from '@/utils/request'

export function login (data) {
  return request('/user/login', 'post', data)
}

export function register (data) {
  return request('/user/register', 'post', data)
}

export function getUserInfo () {
  return request('/user/getUserInfo', 'get')
}

export function updateUserInfo (data) {
  return request('/user/updateUserInfo', 'put', data)
}
export function getUserList (data) {
  return request('/user/getUserList')
}

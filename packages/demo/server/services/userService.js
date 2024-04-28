//// chat
const request = require('../utils/request')
// const toQuery=require('../utils/toQuery')
module.exports = {
    getAllUsers() {
        return request('/user')
    },
    addUser(name, username, password) {
        return request('/user', 'post', {
            name, "avatar": "default.png", username, password, createDate: new Date()
        })
    },
    findUser(params) {
        return request('/user', 'get', params)
    },
    getUser(id) {
        return request('/user/' + id)
    },
    async updateUser(id, data) {
        //获取修改前的用户信息
        const user = await this.getUser(id)
        //修改信息  return
        return request('/user/' + id, 'put', {...user, ...data})


    }
}
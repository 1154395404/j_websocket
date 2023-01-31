const userService = require('../services/userService')
const chatService = require('../services/chatService')
const jwt = require('../utils/jwt')
module.exports = {
    async login(req, {respond}) {
        const {username, password} = req.body
        const users = await userService.findUser({username, password})
        //用户存在
        if (users.length) {
            delete users[0].password
            respond({
                data: {
                    token: jwt.sign(users[0])
                },
                status: 1,
                message: '登录成功'
            });
        } else {
            respond({
                status: 0,
                message: '登录失败 用户名或密码错误'
            });
        }
    },
    async register(req, {respond}) {
        const {name, username, password} = req.body
        const users = await userService.findUser({username})
        //用户存在
        if (users.length) {
            respond({
                status: 0,
                message: '注册失败 用户已存在'
            });
        } else {
            const jsonRes = await userService.addUser(name, username, password)
            const groupRow = await chatService.findGroupChatRow()
            groupRow.user[jsonRes.id] = {notReadMessageCount: 0}
            await chatService.updateChatRow(groupRow.id, groupRow)
            respond({
                data: jsonRes,
                message: '注册成功'
            });
        }
    },
    async getUserInfo(req, {respond}) {
        const user = await userService.getUser(req.user.id)
        respond({
            data: user,
            message: '用户信息获取成功'
        })
    },
    async updateUserInfo(req, {respond}) {
        const {id} = req.user
        const newUserInfo = await userService.updateUser(id, req.body)
        delete newUserInfo.password
        respond({
            data: newUserInfo,
            message: '信息修改成功'
        })
    },
    async getUserList(req, {respond}) {
        const {id} = req.user
        const list = await userService.getAllUsers()


        const userObject = {}
        for (const user of list) {
            delete user.password
            if (user.id !== id) {
                const chatRow = await chatService.findChatRow(user.id, id)
                user.lastMessage = chatRow.lastMessage
                user.notReadMessageCount = chatRow.user[id].notReadMessageCount
                userObject[user.id] = user
            }
        }
        respond({
            data: userObject,
            message: '用户列表获取成功'
        })
    }
}
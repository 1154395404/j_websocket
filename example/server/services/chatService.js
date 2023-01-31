const request = require("../utils/request");
const {getAllUsers} = require("./userService");
const chatService = {
    getInitRowDate(id1, id2) {
        return {
            token: this.calcToken(id1, id2),
            list: [],
            lastMessage: {
                message: '',
                from: '',
                to: '',
                date: '',
            },
            user: {
                [id1]: {
                    notReadMessageCount: 0
                },
                [id2]: {
                    notReadMessageCount: 0
                }
            }
        }
    },
    calcToken(id1, id2) {
        return `${Math.min(id1, id2)}_${Math.max(id1, id2)}`
    }, initChatList(id1, id2) {
        const row = this.getInitRowDate(id1, id2)
        return request('/chat', 'post', row)
    },
    async findChatRow(id1, id2, isInit = false) {
        // this.initChatList(Math.min(id1, id2), Math.max(id1, id2))
        const chatRow = await request('/chat', 'get', {token: this.calcToken(id1, id2)})
        if (chatRow.length) {
            return chatRow[0]
        } else {
            isInit && this.initChatList(id1, id2)
            return this.getInitRowDate(id1, id2)
        }
    },
    async findGroupChatRow() {
        const list = await request('/chat', 'get', {token: 'group'})
        return list[0]
    },
    async updateChatRow(id, data) {
        //修改信息  return
        return request('/chat/' + id, 'put', data)


    }
    , async initGroupChatList() {
        const list = await request('/chat/', 'get', {token: 'group'})
        if (!list.length) {
            const row = {
                token: `group`,
                list: [],
                lastMessage: {
                    message: '',
                    from: '',
                    to: '',
                    date: '',
                },
                user: {}
            }
            const users = await getAllUsers()
            users.forEach((user) => row.user[user.id] = {notReadMessageCount: 0})
            return request('/chat', 'post', row)
        }

    }
}

chatService.initGroupChatList()
module.exports = chatService

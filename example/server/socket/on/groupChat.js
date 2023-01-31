const chatService = require("../../services/chatService");
module.exports = async (message, options) => {
    //接收 群发
    delete message.to
    message.date = new Date()
    const row = await chatService.findGroupChatRow()
    row.lastMessage = message
    row.list.push(message)
    Object.entries(row.user).forEach(([k, v]) => {
        if (+k !== message.from)
            v.notReadMessageCount = v.notReadMessageCount + 1
    })
    await chatService.updateChatRow(row.id, row)
    options.broadcast('onGroupMessage', message)

}
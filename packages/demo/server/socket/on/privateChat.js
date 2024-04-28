const chatService = require("../../services/chatService");
module.exports = async (data, options) => {
    //接收 私发
    data.date = new Date()
    const row = await chatService.findChatRow(data.to, data.from)
    row.lastMessage = data
    row.list.push(data)
    row.user[data.to].notReadMessageCount = row.user[data.to].notReadMessageCount + 1
    await chatService.updateChatRow(row.id, row)
    options.broadcast('onMessage', data)
    // !onlineList.includes(id)&&onlineList.push(id)
}
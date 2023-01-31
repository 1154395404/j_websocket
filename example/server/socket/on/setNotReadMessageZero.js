const chatService = require("../../services/chatService");
module.exports = async (data, options) => {
    //接收 私发
    const {id} = options.user
    const {targetId} = data
    let row = null
    if (targetId !== '-1') {
        row = await chatService.findChatRow(id, targetId)
    } else {
        row = await chatService.findGroupChatRow()
    }
    row.user[id].notReadMessageCount = 0
    await chatService.updateChatRow(row.id, row)
}
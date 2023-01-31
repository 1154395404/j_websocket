const chatService = require("../../services/chatService");
module.exports = async (data, options) => {
    const {id} = options.user
    const {targetId} = data
    let list = null
    if (targetId === '-1')
        list = await chatService.findGroupChatRow()
    else
        list = await chatService.findChatRow(id, targetId, true)
    options.respond(list)
    // options.broadcast('onOnline',{id})
    // !onlineList.includes(id)&&onlineList.push(id)

}
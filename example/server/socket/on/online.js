const chatService = require("../../services/chatService");
const onlineList = require("../variable/onlineList");
module.exports = async (data, options) => {
    const {id} = options.user
    const groupList = await chatService.findGroupChatRow()
    // console.log(groupList)
    const enableGroupList = {
        lastMessage: groupList.lastMessage,
        notReadMessageCount: groupList.user[id]?.notReadMessageCount || 0,
    }
    !onlineList.includes(id) && onlineList.push(id)
    options.broadcast('onOnline', {id})
    options.respond({onlineList,enableGroupList})
}
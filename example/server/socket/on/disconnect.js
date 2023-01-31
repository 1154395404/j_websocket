const onlineList = require("../variable/onlineList");
module.exports = (options) => {
    if (!options.user) return
    const {id: myId} = options.user
    const index = onlineList.findIndex((id) => id === myId)
    index !== -1 && onlineList.splice(index, 1)
    options.broadcast('onOffline', {id: myId})
}
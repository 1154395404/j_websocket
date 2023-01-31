const jwt = require('../utils/jwt')
module.exports = (data, options, next) => {
    const token = data.authorization?.split(' ')[1]
    const user = jwt.verify(token)
    if (user) {
        delete data.authorization
        options.user = user
        next()
    } else {
        options.respond({
            message: 'token 校验失败',
            code:401,
            status: 0
        })
    }
}
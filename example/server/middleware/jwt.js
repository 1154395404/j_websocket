const jwt = require('../utils/jwt')
const whiteList = ['/api/user/login', '/api/user/register']
module.exports = (req, res, next) => {
    if (whiteList.includes(req.url)) {
        next()
    } else {
        const token = req.headers.authorization?.split(' ')[1]
        const user = jwt.verify(token)
        if (user) {
            req.user = user
            next()
        } else {
            res.status(401).send({
                message: 'token 校验失败',
                status: 0
            })
        }
    }
}
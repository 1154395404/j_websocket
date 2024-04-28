const jwt = require('jsonwebtoken');
const secret = 'qingzhi';
module.exports = {
    sign(data) {
        return jwt.sign(data, secret, {expiresIn: '1h'});
    },
    verify(token) {
        try {
            return jwt.verify(token, secret)
        } catch (e) {
            return null
        }
    }
}
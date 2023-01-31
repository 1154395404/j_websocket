const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/login', userController.login);
router.post('/register', userController.register);
router.get('/getUserInfo', userController.getUserInfo);
router.put('/updateUserInfo', userController.updateUserInfo);
router.get('/getUserList', userController.getUserList);
module.exports = router;

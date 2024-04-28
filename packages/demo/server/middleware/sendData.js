module.exports = (req, res, next) => {
    const defaultSuccessConfig = {
        data: {},
        message: '数据响应成功',
        status: 1,
    }
    const defaultErrorConfig = {
        data: {},
        message: '数据操作失败',
        status: 0,
    }

    res.respond = function (data, code = 200) {
        if (code === 200)
            res.send({...defaultSuccessConfig, ...data})
        else
            res.status(code).send({...defaultErrorConfig, ...data})

    }
    next()
}
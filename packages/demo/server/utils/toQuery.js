module.exports = function (object, addProfix = true) {
    if (typeof object !== 'object') {
        console.log('参数需为object类型')
        return ''
    } else {
        let query = addProfix ? '?' : ''
        object.entries(([k, v]) => {
            query += `${k}=${v}&`
        })
        return query
    }
}
const express = require('express');
const formidableMiddleware = require("express-formidable");
const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/upload', formidableMiddleware({
    encoding: 'utf-8',
    uploadDir: './public/upload',
    multiples: true, // req.files to be arrays of files
    keepExtensions:true
}),(req, res)=>{
    // '\\'
   const filename=req.files?.file?.path?.split('\\')?.reverse()[0]
    res.respond({
        data:{
            filename
        },
        message:'文件上传成功'
    })
});
module.exports = router;

const Router = require("@koa/router");
const koaBody = require("koa-body").default; //ES6 export default 的库，CommonJS 加载时需要 .default  //获取上传文件
const { uploadFiles, deleteFile, uploadFile, folderInfo, addFolder, deleteFilesAndFolder, move, getRootFolder } = require('../controllers/fileController')
const authMiddleware = require('../middlewares/authMiddleware');
const checkScope = require("../utils/permission")
// const path = require('path')
const router = new Router();

router.post('/uploadFiles',authMiddleware, koaBody(
    {
        multipart: true, // 支持文件上传
        formidable: {
            multiples: true, //多文件上传
            // uploadDir: path.join(__dirname, '../uploads/temp'),
            keepExtensions: true, // 保留文件后缀名
            maxFileSize: 100 * 1024 * 1024, // 最大 100MB
        }
    }
), uploadFiles)

router.post('/uploadFile', koaBody(
    {
        multipart: true, // 支持文件上传
        formidable: {
            // uploadDir: path.join(__dirname, '../uploads/temp'),
            keepExtensions: true, // 保留文件后缀名
            maxFileSize: 100 * 1024 * 1024, // 最大 100MB
        }
    }
), uploadFile)

router.post('/deleteFile',authMiddleware, deleteFile)

router.get('/folderInfo/:path', authMiddleware, checkScope(['read']), folderInfo)

router.post('/addFolder',authMiddleware, addFolder)

router.get('/getRootFolder',authMiddleware, getRootFolder)

router.post('/deleteFilesAndFolder', authMiddleware, checkScope(['admin']), deleteFilesAndFolder)

router.post('/moveFiles', authMiddleware,  move)

module.exports = router;
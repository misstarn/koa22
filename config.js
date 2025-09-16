const dotenv = require('dotenv')
const path = require('path')
const fs = require('fs')

// 获取当前环境
const env = process.env.NODE_ENV || 'development'

// 找到对应的.env文件
const envFile = path.resolve(process.cwd(), `.env.${env}`)


if(fs.existsSync(envFile)) {
    dotenv.config({ path: envFile })
    console.log(`${env} envFile is loaded`)
} else {
    console.log('No .env file found')
}

module.exports = {
    env,
    port: process.env.PORT || 3000,
    secret: process.env.SECRET,
    dbHost: process.env.DB_HOST,
    uploadPath: process.env.UPLOAD_PATH || 'uploads/'
}

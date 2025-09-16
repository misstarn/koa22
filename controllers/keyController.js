const { ApiKey } = require("../models")
const crypto = require("crypto")

exports.getAll = async (ctx) => {
    const keys = await ApiKey.findAll()
    ctx.body = {
        code: 200,
        data: keys
    }
}

function generateKey(length = 32) {
    return crypto.randomBytes(length).toString("hex")
}

exports.create = async (ctx) => {
    const { expiresIn = 24, scope = "read" } = ctx.request.body
    const key = generateKey(32)
    const expirseAt = new Date(Date.now() + expiresIn * 60 * 60 * 1000)
    const apiKey = await ApiKey.create({
        key,
        expirseAt,
        scope
    })
    console.log('key已创建', apiKey.key)
    ctx.body = {
        code: 200,
        message: 'API Key 已创建',
        data: apiKey
    }
}

exports.deleteKey = async (ctx) => {  
    await ApiKey.destory({
        where: {
            id: ctx.params.id
        }
    })
    ctx.body = {
        code: 200,
        message: 'API Key 已删除'
    }
}
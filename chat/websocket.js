const WebSocket = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');
const { secret } = require('../config');

let users = new Map();

function createWebSocketServer(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws, req) => {
        console.log('客户端连接成功！')
        const { query } = url.parse(req.url, true);
        const token = query.token;

        let username;

        try {
            const decoded = jwt.verify(token, secret);
            username = decoded.username;
            users.set(username, ws)
            ws.username = username
        } catch {
            ws.send(JSON.stringify({ system: true, message: '无效的 token, 连接关闭' }))
            ws.close()
            return
        }

        console.log('客户端连接成功！', username)

        ws.on('message', (message) => {
            console.log('收到客户端消息：', message.toString('utf-8'))

            let msg = message.toString('utf-8')
            msg = JSON.parse(msg)
            console.log(msg, '则个')
            const data = {
                from: username,
                message: msg.message,
                time: new Date().toLocaleString()
            }
           
            for (let client of wss.clients) {
                console.log(client.username, msg.username, username)
                if(client.username === msg.username && client.readyState === WebSocket.OPEN && client.username !== username) {
                    client.send(JSON.stringify(data))
                }
            }
        })

        ws.on('close', () => {
            console.log('客户端断开连接！', username)
            users.delete(username)
        })
    })
}

module.exports = { createWebSocketServer }
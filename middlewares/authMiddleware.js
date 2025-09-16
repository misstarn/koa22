const { ApiKey } = require("../models");
const jwt = require("jsonwebtoken");
const config = require("../config")
const secret = config.secret;

const authMiddleware = async (ctx, next) => {
  const bearer = ctx.headers["authorization"];
  const apiKey = ctx.headers["x-api-key"];
  console.log(bearer, "bearer")
  if (bearer?.startsWith("Bearer ")) {
    const token = bearer.split(" ")[1];
    try {
      const user = jwt.verify(token, secret);
      console.log(user, 'userrrrrrrrrrrrr')
      ctx.state.user = user;
      ctx.state.authType = "token";
      ctx.state.apiScope = user.permissions;
      return await next();
    } catch (error) {
      console.log('无效的Token', token.toString())
      ctx.status = 401
      ctx.body = {message: '无效的Token'}
      return
      // return ctx.throw(401, "");
    }
  }

  if(apiKey) {
    const keyRecord = await ApiKey.findOne({ where: { key: apiKey } });
    if (!keyRecord) {
      console.log('无效的API Key')
      ctx.status = 401
      ctx.body = {message: '无效的API Key'}
      return
      // return ctx.throw(401, "无效的API Key");
    }
    if (new Date() > keyRecord.expiredAt) {
      console.log('API Key已过期')
      ctx.status = 403
      ctx.body = {message: 'API Key已过期'}
      return
      // return ctx.throw(403, "API Key已过期");
    }
    ctx.state.apiScope = keyRecord.scope.split(",");
    ctx.state.authType = "apikey";
    ctx.state.user = null
    return await next();
  }

  // 未提供Token
  console.log('未提供Token')
  ctx.status = 401
  ctx.body = { message: '未提供Token'}
  return
  // return ctx.throw(401, "未提供Token");
};

module.exports = authMiddleware;

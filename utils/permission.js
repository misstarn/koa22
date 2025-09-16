module.exports = function checkScope(requiredScopes = []) {
    return async (ctx, next) => {
        console.log('权限:', ctx.state.authType, ctx.state,  ctx.state.apiScope)
        const scopes = ctx.state.apiScope || []
        const isAuthorized = requiredScopes.every((scope) => scopes.includes(scope))
        if (!isAuthorized) {
            console.log('没有权限')
            ctx.status = 403
            ctx.body = {
                message: '没有权限'
            }
            return
        }
        // 有权限，进入下一步 
        await next()
    }
}
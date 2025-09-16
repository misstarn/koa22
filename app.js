// --- app.js ---
const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('@koa/router');
const admin_router = require('./routes/admin');
const user_router = require('./routes/user');
const test_router = require('./routes/test');
const file_router = require('./routes/file');
const apikey_router = require('./routes/apikey');
const topic_router = require('./routes/topic')
const jwt = require('koa-jwt');
const serve = require('koa-static')  //静态资源访问
const path = require('path')
const swaggerUi = require('koa2-swagger-ui')
const swaggerSpec = require('./config/swagger')
const { sequelize } = require('./models') // 引入 sequelize
const cors = require('koa2-cors');
const views = require('koa-views')
const mount = require('koa-mount')
const config = require('./config')
const { createWebSocketServer } = require('./chat/websocket')

const app = new Koa();

const secret = config.secret;
console.log(secret)

app.use(cors());

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ 数据库连接成功！');
    // await sequelize.sync({ alter: true });  //开发环境使用
    await sequelize.sync({ force: false }); //生产环境使用
    console.log('✅ 数据库同步成功！')
  } catch (error) {
    console.error('❌ 数据库连接失败！', error);
  }
})();


app.use(mount('/uploads',serve(path.join(__dirname, 'uploads'))))
app.use(mount('/static', serve(path.join(__dirname, 'static'))))

app.use(views(path.join(__dirname, 'views'), { extension: 'html'}))

app.use(bodyParser());

app.use(jwt({ secret }).unless({ path: [/^\/login/, 
  /^\/register/, 
  /^\//, 
  /^\/auth/, 
  /^\/topic/, 
  /^\/docs/, 
  /^\/refresh/,  
  /^\/test/, 
  // /^\/file/, 
  /^\/uploads/, 
  /^\/apiKey/, 
] })); // 除了登录注册登出刷新外都校验 JWT



const mainRouter = new Router();

mainRouter.get('/docs', swaggerUi.koaSwagger({
  routePrefix: '/docs',
  swaggerOptions: {
    spec: swaggerSpec
  }
}))


mainRouter.use(admin_router.routes(), admin_router.allowedMethods());
mainRouter.use(user_router.routes(), user_router.allowedMethods());
mainRouter.use('/test', test_router.routes(), test_router.allowedMethods());
mainRouter.use('/file', file_router.routes(), file_router.allowedMethods());
mainRouter.use('/apiKey', apikey_router.routes(), apikey_router.allowedMethods());
mainRouter.use('/topic', topic_router.routes(), topic_router.allowedMethods());

app.use(mainRouter.routes()).use(mainRouter.allowedMethods());

const server =  app.listen(9920, () => {
  console.log('🚀 Server running at http://localhost:9920');
});

// 启动websocket服务
createWebSocketServer(server);

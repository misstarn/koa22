// --- routes/user.js ---
const Router = require('@koa/router');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const checkScope = require("../utils/permission")

const router = new Router();
/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags:
 *       - Auth 鉴权模块
 *     summary: 用户注册
 *     description: 用户通过邮箱和密码进行注册
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: 用户邮箱
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *                 description: 用户密码
 *               username:
 *                 type: string
 *                 format: username
 *                 example: username
 *                 description: 用户姓名
 *     responses:
 *       200:
 *         description: 注册成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 注册成功
 *       400:
 *         description: 参数错误
 *       409:
 *         description: 用户已存在
 */

router.post('/auth/register', userController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth 鉴权模块
 *     summary: 用户登录
 *     description: 输入邮箱和密码进行登录，成功后返回 JWT Token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *                 description: 用户邮箱
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *                 description: 用户密码
 *     responses:
 *       200:
 *         description: 登录成功，返回 token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6...
 *                 message:
 *                   type: string
 *                   example: 登录成功
 *       401:
 *         description: 登录失败（账号或密码错误）
 *       500:
 *         description: 服务器错误
 */

router.post('/auth/login', userController.login);

router.post('/auth/refresh', userController.refresh);
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - Auth 鉴权模块
 *     summary: 用户登出
 *     description: 用户退出登录，服务端会清除对应用户的 refreshToken。
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 登出成功，refreshToken 已清除
 *       401:
 *         description: 未携带或无效的 Token
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
 */


router.post('/auth/logout', authMiddleware, userController.logout);

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - User 用户模块
 *     summary: 获取所有用户
 *     description: 获取系统中所有用户的信息（需要权限验证）
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功返回用户数组
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   email:
 *                     type: string
 *                     example: user@example.com
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-07-01T12:00:00.000Z
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *                     example: 2025-07-01T12:00:00.000Z
 *       401:
 *         description: 未携带或 token 无效
 */

router.get('/users', authMiddleware, checkScope(['admin']),  userController.getAll);
router.get('/admin-users', authMiddleware, checkScope(['admin']),  userController.getAdminAll);

router.post('/users', authMiddleware, userController.create);

router.get('/verify', userController.verify);



module.exports = router;
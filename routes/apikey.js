const Router = require("@koa/router");
const router = new Router();

const { create, deleteKey, getAll } = require("../controllers/keyController")

router.get("/getAll", getAll)

/**
 * @swagger
 * /apiKey/create:
 *   post:
 *     tags:
 *       - API Key
 *     summary: 创建新的 API Key
 *     description: 根据请求参数创建一个新的 API Key，可指定权限范围（scope）与过期时间。
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expiresIn:
 *                 type: integer
 *                 description: API Key 有效时间（单位：小时），默认 24 小时
 *                 example: 48
 *               scope:
 *                 type: string
 *                 description: 权限范围（例如 "read", "write,delete"）
 *                 example: read,write
 *     responses:
 *       200:
 *         description: 成功创建 API Key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: API Key 已创建
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     key:
 *                       type: string
 *                       example: "n6w3kxyvq0fml4t0p2u0t94zxx1z6bpa"
 *                     expirseAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-07-05T08:00:00.000Z"
 *                     scope:
 *                       type: string
 *                       example: "read,write"
 */

router.post("/create", create)

router.post("/delete", deleteKey)

module.exports = router;
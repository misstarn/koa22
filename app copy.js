// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; // 忽略 TLS 证书验证
const koa = require("koa");
const bodyParser = require("koa-bodyparser");
const Router = require("@koa/router");
const cors = require("@koa/cors");
const nodemailer = require("nodemailer");
const app = new koa();
const router = new Router();
const port = 3000;
const db = require("./db/db");

// 启用cors
app.use(cors());

// app.use(cors({
//   origin: 'http://localhost:5173', // 只允许你的前端开发环境
//   credentials: true // 如果你要传 cookie
// }));

const validateEmail = (email) => {
  const regex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  return regex.test(email);
};

const transporter = nodemailer.createTransport({
  host: "smtp.163.com",
  port: 465,
  secure: true,
  auth: {
    user: "misstarn@163.com",
    pass: "YAgBwbPEmm8YKv8r",
  },
  tls: {
    rejectUnauthorized: false, // 忽略自签名/证书链验证失败
  },
});

const verifyRecords = new Map();

router.get("/verify", async (ctx) => {
  const { email } = ctx.query;
  if (!email) {
    ctx.body = {
      code: 400,
      success: false,
      message: "Email is required",
    };
    return;
  } 

  const row = await new Promise((resolve, reject) => {
    db.get(`SELECT * FROM email_verification WHERE email = ?`, [email], (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    })
  })

//   const verifyRecord = verifyRecords.get(email);
  if (!row) {
    ctx.body = {
      code: 400,
      success: false,
      message: "未发送验证邮件或记录已清除",
    };
    return;
  }

  if(row.verified) {
    ctx.body = {
      code: 400,
      success: false,
      message: "已验证",
    };
    return;
  }

  if(Date.now() > row.expire_at) {
    ctx.body = {
      code: 400,
      success: false,
      message: "验证链接已过期",
    };
    return;
  }

  await new Promise((resolve, reject) => {
    db.run(`
        UPDATE email_verification SET verified = 1 WHERE email = ?
    `, [email], (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    })
  })

  ctx.body = {
    code: 200,
    success: true,
    message: "验证成功",
  };
})

function saveEmailVerify(email) {
    return new Promise((resolve, reject) => {
        const now = Date.now();
        const expireAt = now + 5 * 60 * 1000; // 5分钟过期

        db.run(`
            INSERT INTO email_verification(email, created_at, expire_at)
            VALUES(?, ?, ?)
            ON CONFLICT(email) DO UPDATE SET created_at = excluded.created_at, expire_at = excluded.expire_at, verified = 0
       `, [email, now, expireAt], (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        })
    })
}

router.post("/verify-email", async (ctx) => {
  const { email } = ctx.request.body;
  if (!email) {
    ctx.body = {
      code: 400,
      success: false,
      message: "Email is required1",
    };
    return;
  }

  if (!validateEmail(email)) {
    ctx.body = {
      code: 400,
      success: false,
      message: "Email is required1",
    };
    return;
  }

  try {
    await transporter.sendMail({
      from: '"订阅系统" <misstarn@163.com>',
      to: email,
      subject: "欢迎订阅~ 请验证你的邮箱！",
      text: "Hello world?",
      html: `
            <h2>谢谢你订阅我们！</h2>
            <p>请点击以下链接完成验证：</p>
            <a href="http://localhost:3000/verify?email=${encodeURIComponent(email)}">验证邮箱</a>`,
    });
    console.log("发送成功");
    saveEmailVerify(email)
    ctx.body = {
      code: 200,
      success: true,
      message: "发送成功",
    };
  } catch (error) {
    ctx.body = {
      code: 400,
      success: false,
      message: "Email is required1",
    };
  }
});

app.use(bodyParser()).use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

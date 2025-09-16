// --- controllers/userController.js ---

const { User, UserProfile, AdminProfile } = require("../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");

const config = require("../config");
const secret = config.secret;

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

// 验证邮箱
exports.verify = async (ctx) => {
  const { email } = ctx.query;
  if (!email) {
    ctx.body = {
      code: 400,
      message: "Email is required",
    };
    return;
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    (ctx.status = 403), (ctx.body = { message: "未发送验证邮件或记录已清除" });
    return;
  }

  if (user.verified) {
    ctx.body = {
      code: 400,
      success: false,
      message: "已验证",
    };
    return;
  }

  if (Date.now() > user.expireAt) {
    ctx.body = {
      code: 400,
      success: false,
      message: "验证链接已过期",
    };
    return;
  }

  await user.update({ verified: 1 });

  ctx.body = {
    code: 200,
    message: "验证成功",
  };
};

async function sendMail(email) {
  try {
    await transporter.sendMail({
      from: '"订阅系统" <misstarn@163.com>',
      to: email,
      subject: "欢迎订阅~ 请验证你的邮箱！",
      text: "Hello world?",
      html: `
            <h2>谢谢你的注册！</h2>
            <p>请点击以下链接完成验证：</p>
            <a href="http://localhost:9920/verify?email=${encodeURIComponent(
              email
            )}">验证邮箱</a>`,
    });
    return true;
  } catch (err) {
    ctx.body = {
      code: 400,
      message: "Email is required1",
    };
    return false;
  }
}

// 注册
exports.register = async (ctx) => {
  const { username, email, password } = ctx.request.body;
  const user = await User.findOne({ where: { email } });
  if (user) {
    (ctx.status = 403), (ctx.body = { message: "用户已存在" });
    return;
  }
  const hash = await bcrypt.hash(password, 10);
  const now = Date.now();
  const expireAt = now + 5 * 60 * 1000;

  const count = await User.count();
  let profile = null
  if(count == 0) {
    profile = {
       admin_profile: {
          permissions: JSON.stringify(["read", "write", "admin"]),
          role:"super_admin",
        },
    }
  } else {
    profile = {
      user_profile: {
        nickname: '',
        gender: 'other'
      }
    }
  }

  try {
    const user2 = await User.create(
      {
        username,
        email,
        expireAt,
        status: count === 0 ? "active" : "inactive",
        password: hash,
        ...profile
      },
      {
        include: [
          {
            model: AdminProfile,
            as: "admin_profile",
          },
          {
            model: UserProfile,
            as: "user_profile",
          }
        ],
      }
    );

    await sendMail(email);
    ctx.body = {
      code: 200,
      message: "注册成功,请验证邮箱",
      data: {
        id: user2.id,
        username: user2.username,
        email: user2.email,
        createdAt: user2.createdAt,
        updatedAt: user2.updatedAt,
      },
    };
  } catch (err) {
    console.log(err);
  }
};

// 登录
exports.login = async (ctx) => {
  const { email, password } = ctx.request.body;
  const user = await User.findOne({ where: { email } });
  if (!user) return (ctx.status = 403), (ctx.body = { message: "用户不存在" });

  if (user?.status == "inactive") {
    ctx.status = 403;
    ctx.body = { message: "邮箱未验证" };
    return;
  }
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return (ctx.status = 403), (ctx.body = { message: "密码错误" });

  const admin_profile = await AdminProfile.findOne({
    where: { user_id: user.id },
  });

  const token = jwt.sign(
    {
      id: user.id,
      permissions: admin_profile?.permissions,
      username: user.username,
    },
    secret,
    { expiresIn: "1m" }
  );
  const refreshToken = jwt.sign({ id: user.id }, secret, { expiresIn: "1d" });
  await user.update({ refreshToken });
  console.log({ id: user.id, email: user.email, username: user.username });
  ctx.body = {
    token: { token, refreshToken },
    user: { id: user.id, email: user.email, username: user.username },
  };
};

// 刷新token
exports.refresh = async (ctx) => {
  const { refreshToken } = ctx.request.body;
  try {
    const payload = jwt.verify(refreshToken, secret);
    const user = await User.findByPk(payload.id);
    if (!user || user.refreshToken !== refreshToken)
      throw new Error("Invalid refresh token");
    const admin_profile = await AdminProfile.findOne({
      where: { user_id: user.id },
    });

    const newToken = jwt.sign(
      {
        id: user.id,
        permissions: admin_profile?.permissions,
        username: user.username,
      },
      secret,
      { expiresIn: "1m" }
    );
    ctx.body = { token: newToken };
  } catch (err) {
    ctx.status = 401;
    ctx.body = { message: "刷新令牌无效" };
  }
};

// 退出登录，清空token
exports.logout = async (ctx) => {
  try {
    console.log(ctx.state.user); // JWT 解出的 user
    const userId = ctx.state.user.id;
    const user = await User.findByPk(userId);
    if (user) {
      await user.update({ refreshToken: null });
      ctx.body = { code: 200, message: "登出成功，refreshToken 已清除" };
    } else {
      ctx.status = 404;
      ctx.body = { message: "用户不存在" };
    }
  } catch (err) {
    ctx.status = 500;
    ctx.body = { message: "登出失败" };
  }
};

exports.getAdminAll = async (ctx) => {
  const users = await User.findAll({
    attributes: { exclude: ["password", "refreshToken"] },
    include: [
      {
        model: AdminProfile,
        as: "admin_profile",
        required: true
      }
    ]
  });
  ctx.body = {
    code: 200,
    data: users,
  };
};

exports.getAll = async (ctx) => {
  const users = await User.findAll({
    attributes: { exclude: ["password", "refreshToken"] },
    include: [
      {
        model: UserProfile,
        as: "user_profile",
        required: true
      }
    ]
  });
  ctx.body = {
    code: 200,
    data: users,
  };
};

// 创建admin账号
exports.create = async (ctx) => {
  const { username, email, password } = ctx.request.body; 
  console.log('ctx.request.body', ctx.request.body)
  const user = await User.findOne({ where: { email } });
  if (user) {
    (ctx.status = 403), (ctx.body = { message: "用户已存在" });
    return;
  }
  const hash = await bcrypt.hash(password, 10);

  try {
    const user2 = await User.create(
      {
        username,
        email,
        status: "active",
        password: hash,
        admin_profile: {
          permissions: JSON.stringify(ctx.request.body.permissions),
          role: 'viewer'
        },
      },
      {
        include: [
          {
            model: AdminProfile,
            as: "admin_profile",
          },
        ],
      }
    );

    ctx.body = {
      code: 200,
      message: "创建成功",
      data: {
        id: user2.id,
        username: user2.username,
        email: user2.email,
        createdAt: user2.createdAt,
        updatedAt: user2.updatedAt,
      },
    };
  } catch (err) {
    console.log(err);
  }
};

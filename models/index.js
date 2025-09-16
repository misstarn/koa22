const path = require('path');
const fs = require('fs');
const Sequelize = require('sequelize');
const sequelize = require('../config/database')

const basename = path.basename(__filename);
const db = {};

// const sequelize = new Sequelize(process.env.DATABASE_URL, {
//   // 其他配置
// });

fs.readdirSync(__dirname)
  .filter(file => {
    return file !== basename && file.endsWith('.js');
  })
  .forEach(file => {
    const modelFactory = require(path.join(__dirname, file));
    const model = modelFactory(sequelize, Sequelize.DataTypes); // ✅ 调用工厂函数
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db); // 建立关系
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
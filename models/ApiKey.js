const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ApiKey extends Model {}

  ApiKey.init({
    key: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: 'key'
    },
    expirseAt: {
        type: DataTypes.DATE,
        allowNull: false
    },
    scope: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'read'
    }
  }, {
    sequelize,
    modelName: 'ApiKey',
  });

  return ApiKey;
}
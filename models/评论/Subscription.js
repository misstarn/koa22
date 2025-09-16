const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      Subscription.belongsToMany(models.User, { through: "UserSubscription" }); // ✅ 关联在这写
    }
  }

  Subscription.init({
     type: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Subscription',
  });

  return Subscription;
};
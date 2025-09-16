const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserProfile extends Model {
    static associate(models) {
      UserProfile.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  UserProfile.init({
    nickname: DataTypes.STRING,
    birthday: DataTypes.DATEONLY,
    phone: DataTypes.STRING(20),
    address: DataTypes.TEXT,
    gender: DataTypes.ENUM("male", "female", "other"),
  }, {
    sequelize,
    modelName: 'UserProfile',
    tableName: "user_profiles",
    timestamps: true,
  });

  return UserProfile;
};

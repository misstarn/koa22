const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.FriendGroup, { foreignKey: "user_id", as: 'groups'});
      User.hasMany(models.Friend, { foreignKey: 'user_id', as: 'myFriends' })
      User.hasMany(models.Friend, { foreignKey: 'friend_id', as: 'addedME'})

      User.hasOne(models.UserProfile, { foreignKey: 'user_id', as: 'user_profile'})
      User.hasOne(models.AdminProfile, { foreignKey: 'user_id', as: 'admin_profile' })
    }
  }

  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    avatar: DataTypes.STRING(255),
    refreshToken: DataTypes.STRING(255),
    expireAt: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM("active", "inactive", "banned"),
      defaultValue: "active",
    },
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    paranoid: true
  });

  return User;
};

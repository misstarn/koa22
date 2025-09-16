const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Friend extends Model {
    static associate(models) {
        Friend.belongsTo(models.User, { foreignKey: 'user_id', as: 'user'}) //谁加的
        Friend.belongsTo(models.User, { foreignKey: 'friend_id', as: 'friendInfo'})  //朋友
        Friend.belongsTo(models.FriendGroup, { foreignKey: 'group_id', as: 'group'})
    }
  }
  Friend.init({
   note: {
      type: DataTypes.INTEGER,
    },
    is_blocked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
  }, {
    sequelize,
    modelName: 'Friend',
  });
  return Friend;
};
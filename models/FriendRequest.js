const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class FriendRequest extends Model {
    static associate(models) {
      FriendRequest.belongsTo(models.User, {
        foreignKey: "from_user_id",
        as: "fromUser",
      });
      FriendRequest.belongsTo(models.User, {
        foreignKey: "to_user_id",
        as: "toUser",
      });
    }
  }
  FriendRequest.init(
    {
      note: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
      },
    },
    {
      sequelize,
      modelName: "FriendRequest",
    }
  );
  return FriendRequest;
};

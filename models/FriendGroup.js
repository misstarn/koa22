const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FriendGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
     static associate(models) {
      // define association here
      FriendGroup.belongsTo(models.User, { foreignKey: 'user_id', as: 'owner'})
      FriendGroup.hasMany(models.Friend, { foreignKey: 'group_id', as: 'friends' })
    }
  };
  FriendGroup.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'FriendGroup',
  });
  return FriendGroup;
};
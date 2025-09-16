const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AdminProfile extends Model {
    static associate(models) {
      AdminProfile.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }

  AdminProfile.init({
    role: {
      type: DataTypes.ENUM("super_admin", "editor", "viewer", "null"),
      defaultValue: "null",
    },
    permissions: {
      type: DataTypes.JSON, // 存储 ["manage_users","edit_content"]
    },
    department: DataTypes.STRING(100),
  }, {
    sequelize,
    modelName: 'AdminProfile',
    tableName: "admin_profiles",
    timestamps: true,
  });

  return AdminProfile;
};

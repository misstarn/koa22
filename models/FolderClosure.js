const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FolderClosure extends Model {
    static associate(models) {
        
    }
  }
  FolderClosure.init({
    ancestor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    descendant_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    depth: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
  }, {
    sequelize,
    modelName: 'FolderClosure',
  });
  return FolderClosure;
}
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Folder extends Model {
    static associate(models) {
        Folder.hasMany(models.Folder, {
            foreignKey: 'parent_id',
            as: 'children'
        })

        Folder.hasMany(models.File, {
            foreignKey: 'folder_id',
        })

        Folder.hasMany(models.FolderClosure, {
          foreignKey: 'ancestor_id',
          as: "descendants"
        })

        Folder.hasMany(models.FolderClosure, {
          foreignKey: "descendant_id",
          as: "ancestors"
        })
    }
  }
  Folder.init({
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
  }, {
    sequelize,
    modelName: 'Folder',
  });
  return Folder;
}
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Topic extends Model {
    static associate(models) {
        Topic.hasMany(models.Comment, { foreignKey: 'topicId' });
    }
  }

  Topic.init({
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    author: DataTypes.STRING,
    cover: DataTypes.STRING,
    images: DataTypes.TEXT,
    tags: DataTypes.STRING,
    anonymity: DataTypes.BOOLEAN,
    showID: DataTypes.BOOLEAN,
    hot: DataTypes.INTEGER,
    status: {
        type: DataTypes.ENUM,
        values: ['draft', 'published', 'deleted'],
        defaultValue: 'draft'
    }
  }, {
    sequelize,
    modelName: 'Topic',
  });

  return Topic;
};

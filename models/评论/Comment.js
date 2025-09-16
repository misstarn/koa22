const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comment extends Model {
    static associate(models) {
        Comment.belongsTo(models.Topic, { foreignKey: 'topicId' });
        Comment.hasMany(models.Comment, { foreignKey: 'parentCommentId' });
        Comment.belongsTo(models.Comment, {as: 'parentComment', foreignKey: 'parentCommentId'})
        Comment.hasMany(models.Downvote, {foreignKey: 'commentId'})
    }
  }

  Comment.init({
    content: DataTypes.TEXT,
    index: DataTypes.INTEGER,
    author: DataTypes.STRING,
    cover: DataTypes.STRING,
    images: DataTypes.TEXT,
    love: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    dislike: {
      type: DataTypes.INTEGER,
        defaultValue: 0
    },
    anonymity: DataTypes.BOOLEAN,
    showID: DataTypes.BOOLEAN,
    status: {
        type: DataTypes.ENUM,
        values: ['draft', 'published', 'deleted'],
        defaultValue: 'draft'
    }
  }, {
    sequelize,
    modelName: 'Comment',
  });

  return Comment;
};

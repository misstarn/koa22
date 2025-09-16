const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Downvote extends Model {
    static associate(models) {
        Downvote.belongsTo(models.Comment, { foreignKey: 'commentId' })
    }
  }

  Downvote.init({
    ip: DataTypes.STRING,
    type: {
        type: DataTypes.ENUM,
        values: ['love', 'dislike'],
    },
    userAgent: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Downvote',
  });

  return Downvote;
};

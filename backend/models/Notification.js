const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db').sequelize;

class Notification extends Model {
  toString() {
    return this.id.toString();
  }
}

Notification.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Notification message is required' }
    }
  },
  read: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  // Virtual field _id for Mongoose compatibility
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    }
  }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['userId', 'createdAt']
    }
  ]
});

module.exports = Notification;

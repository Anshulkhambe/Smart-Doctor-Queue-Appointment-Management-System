const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db').sequelize;

class Patient extends Model {
  toString() {
    return this.id ? this.id.toString() : '';
  }

  toJSON() {
    const values = { ...this.get() };
    values._id = this.id;
    return values;
  }
}

Patient.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    get() {
      const populatedUser = this.getDataValue('user');
      if (populatedUser) {
        return populatedUser;
      }
      return this.getDataValue('userId');
    }
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Phone number is required' }
    }
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Age cannot be negative' }
    }
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Male', 'Female', 'Other']],
        msg: 'Gender must be Male, Female, or Other'
      }
    }
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
  modelName: 'Patient',
  tableName: 'patients',
  timestamps: true
});

module.exports = Patient;

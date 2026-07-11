const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db').sequelize;

class Doctor extends Model {
  toString() {
    return this.id ? this.id.toString() : '';
  }

  toJSON() {
    const values = { ...this.get() };
    values._id = this.id;
    values.workingHours = this.workingHours;
    return values;
  }
}

Doctor.init({
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
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Specialization is required' }
    }
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Experience cannot be negative' }
    }
  },
  clinic: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Clinic address is required' }
    }
  },
  fees: {
    type: DataTypes.DOUBLE,
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Fees cannot be negative' }
    }
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  image: {
    type: DataTypes.STRING,
    defaultValue: ''
  },
  workingHoursStart: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '09:00'
  },
  workingHoursEnd: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: '17:00'
  },
  // Virtual field _id for Mongoose compatibility
  _id: {
    type: DataTypes.VIRTUAL,
    get() {
      return this.id;
    }
  },
  // Virtual field workingHours for Mongoose compatibility
  workingHours: {
    type: DataTypes.VIRTUAL,
    get() {
      return {
        start: this.workingHoursStart,
        end: this.workingHoursEnd
      };
    },
    set(val) {
      if (val) {
        this.setDataValue('workingHoursStart', val.start || '09:00');
        this.setDataValue('workingHoursEnd', val.end || '17:00');
      }
    }
  }
}, {
  sequelize,
  modelName: 'Doctor',
  tableName: 'doctors',
  timestamps: true
});

module.exports = Doctor;

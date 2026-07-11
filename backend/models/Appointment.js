const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/db').sequelize;

class Appointment extends Model {
  toString() {
    return this.id ? this.id.toString() : '';
  }

  toJSON() {
    const values = { ...this.get() };
    values._id = this.id;
    return values;
  }
}

Appointment.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  date: {
    type: DataTypes.STRING, // Format: YYYY-MM-DD
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Appointment date is required' }
    }
  },
  time: {
    type: DataTypes.STRING, // Format: HH:MM
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Appointment time is required' }
    }
  },
  queueNumber: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled'),
    defaultValue: 'Pending',
    allowNull: false,
    validate: {
      isIn: {
        args: [['Pending', 'Confirmed', 'In-Progress', 'Completed', 'Cancelled']],
        msg: 'Status must be Pending, Confirmed, In-Progress, Completed, or Cancelled'
      }
    }
  },
  estimatedWait: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
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
  modelName: 'Appointment',
  tableName: 'appointments',
  timestamps: true,
  indexes: [
    {
      fields: ['doctorId', 'date', 'queueNumber']
    },
    {
      fields: ['patientId']
    }
  ]
});

module.exports = Appointment;

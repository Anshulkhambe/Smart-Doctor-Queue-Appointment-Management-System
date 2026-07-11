const sequelize = require('../config/db').sequelize;
const User = require('./User');
const Doctor = require('./Doctor');
const Patient = require('./Patient');
const Appointment = require('./Appointment');
const Notification = require('./Notification');

const initAssociations = () => {
  // User <-> Doctor (One-to-One)
  User.hasOne(Doctor, { foreignKey: 'userId', as: 'doctor', onDelete: 'CASCADE' });
  Doctor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User <-> Patient (One-to-One)
  User.hasOne(Patient, { foreignKey: 'userId', as: 'patient', onDelete: 'CASCADE' });
  Patient.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // User <-> Notification (One-to-Many)
  User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications', onDelete: 'CASCADE' });
  Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

  // Patient <-> Appointment (One-to-Many)
  Patient.hasMany(Appointment, { foreignKey: 'patientId', as: 'appointments', onDelete: 'CASCADE' });
  Appointment.belongsTo(Patient, { foreignKey: 'patientId', as: 'patient' });

  // Doctor <-> Appointment (One-to-Many)
  Doctor.hasMany(Appointment, { foreignKey: 'doctorId', as: 'appointments', onDelete: 'CASCADE' });
  Appointment.belongsTo(Doctor, { foreignKey: 'doctorId', as: 'doctor' });
};

module.exports = {
  sequelize,
  User,
  Doctor,
  Patient,
  Appointment,
  Notification,
  initAssociations
};

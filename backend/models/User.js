const { DataTypes, Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db').sequelize;

class User extends Model {
  /**
   * Compares a candidate password with the user's hashed password.
   * 
   * @param {string} candidatePassword - Password to test
   * @returns {Promise<boolean>} - True if match, false otherwise
   */
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Override toString to behave like Mongoose ObjectId for ID checks
  toString() {
    return this.id ? this.id.toString() : '';
  }

  toJSON() {
    const values = { ...this.get() };
    values._id = this.id;
    return values;
  }
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Name is required' }
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: { msg: 'A user with this email address already exists' },
    validate: {
      isEmail: { msg: 'Please provide a valid email address' },
      notEmpty: { msg: 'Email is required' }
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password is required' },
      len: {
        args: [6, 100],
        msg: 'Password must be at least 6 characters long'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('Admin', 'Doctor', 'Patient'),
    allowNull: false,
    validate: {
      isIn: {
        args: [['Admin', 'Doctor', 'Patient']],
        msg: 'Role must be Admin, Doctor, or Patient'
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
  modelName: 'User',
  tableName: 'users',
  timestamps: true,
  hooks: {
    beforeSave: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

module.exports = User;

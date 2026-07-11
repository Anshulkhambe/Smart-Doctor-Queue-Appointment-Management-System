const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const jwt = require('jsonwebtoken');

/**
 * Generates a signed JWT token for a given user ID.
 * 
 * @param {number|string} id - The User ID
 * @returns {string} - JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

/**
 * Registers a new user. 
 * Automatically generates a profile document in Patients or Doctors tables depending on role.
 * Implements rollback cleaning on failure to maintain database integrity.
 */
const register = async (req, res, next) => {
  const { name, email, password, role } = req.body;

  try {
    // 1. Verify user does not already exist
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      res.status(400);
      return next(new Error('A user with this email address already exists'));
    }

    // 2. Create and save base User
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    // 3. Create associated profile based on the role
    try {
      if (role === 'Patient') {
        const { phone, age, gender } = req.body;
        await Patient.create({
          userId: user.id,
          phone,
          age,
          gender
        });
      } else if (role === 'Doctor') {
        const { specialization, experience, clinic, fees, workingHours } = req.body;
        await Doctor.create({
          userId: user.id,
          specialization,
          experience,
          clinic,
          fees,
          workingHours: workingHours || { start: '09:00', end: '17:00' }
        });
      }
    } catch (profileError) {
      // Rollback: delete base User if profile creation fails
      await user.destroy();
      throw profileError;
    }

    // 4. Generate JWT and respond
    const token = generateToken(user.id);
    
    // Fetch profile ID to return to front-end for immediate use
    let profileId = null;
    if (role === 'Patient') {
      const p = await Patient.findOne({ where: { userId: user.id } });
      profileId = p?.id || null;
    } else if (role === 'Doctor') {
      const d = await Doctor.findOne({ where: { userId: user.id } });
      profileId = d?.id || null;
    }

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Log in a user. Validates password and issues JWT.
 * Returns linked profile ID for unified client routing.
 */
const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 1. Fetch user including password
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // 2. Validate password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401);
      return next(new Error('Invalid email or password'));
    }

    // 3. Resolve profile identity for UI binding
    let profileId = null;
    if (user.role === 'Patient') {
      const patientRecord = await Patient.findOne({ where: { userId: user.id } });
      if (patientRecord) profileId = patientRecord.id;
    } else if (user.role === 'Doctor') {
      const doctorRecord = await Doctor.findOne({ where: { userId: user.id } });
      if (doctorRecord) profileId = doctorRecord.id;
    }

    // 4. Return token and user status details
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileId
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Dummy controller for logout (handles client side cookie deletion notifications).
 */
const logout = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

module.exports = {
  register,
  login,
  logout
};

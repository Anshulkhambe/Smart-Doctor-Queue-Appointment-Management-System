const Doctor = require('../models/Doctor');
const User = require('../models/User');
const { Op } = require('sequelize');

/**
 * Gets a list of all doctors. Supports optional query filters:
 * - search: filters doctors by user name (case-insensitive search)
 * - specialization: filters by medical specialization (case-insensitive search)
 * - availability: filters by active availability (boolean)
 * - minExperience: filters by years of experience (minimum threshold)
 */
const getDoctors = async (req, res, next) => {
  try {
    const { specialization, availability, minExperience, search } = req.query;
    
    let query = {};
    
    // Apply specialization filter
    if (specialization) {
      query.specialization = { [Op.like]: `%${specialization}%` };
    }
    
    // Apply availability filter
    if (availability !== undefined) {
      query.availability = availability === 'true';
    }
    
    // Apply experience filter
    if (minExperience) {
      query.experience = { [Op.gte]: parseInt(minExperience, 10) };
    }

    // Apply name search filter
    if (search) {
      const users = await User.findAll({
        where: {
          name: { [Op.like]: `%${search}%` },
          role: 'Doctor'
        },
        attributes: ['id']
      });
      
      const userIds = users.map(u => u.id);
      query.userId = { [Op.in]: userIds };
    }

    const doctors = await Doctor.findAll({
      where: query,
      include: [{ association: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Gets a single doctor profile by its Doctor ID.
 */
const getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ association: 'user', attributes: ['id', 'name', 'email', 'role'] }]
    });
      
    if (!doctor) {
      res.status(404);
      return next(new Error('Doctor profile not found'));
    }

    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the authenticated doctor's profile.
 * Expects multiform-data due to file uploads.
 */
const updateDoctorProfile = async (req, res, next) => {
  try {
    // Retrieve doctor profile linked to req.user (from protect middleware)
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    
    if (!doctor) {
      res.status(404);
      return next(new Error('Doctor profile not found'));
    }

    const { specialization, experience, clinic, fees, workingHours, availability, name } = req.body;
    
    // Update Doctor fields
    if (specialization) doctor.specialization = specialization;
    if (experience !== undefined) doctor.experience = parseInt(experience, 10);
    if (clinic) doctor.clinic = clinic;
    if (fees !== undefined) doctor.fees = parseFloat(fees);
    
    if (workingHours) {
      // Handle parsing if workingHours is passed as a stringified JSON (from multipart/form-data)
      try {
        const parsedHours = typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;
        doctor.workingHours = parsedHours;
      } catch (parseErr) {
        console.warn('[DoctorController] Failed to parse workingHours string:', parseErr.message);
      }
    }
    
    if (availability !== undefined) {
      doctor.availability = availability === 'true' || availability === true;
    }

    // Save uploaded file path if present
    if (req.file) {
      doctor.image = `/uploads/${req.file.filename}`;
    }

    await doctor.save();

    // If name is modified, update the associated User document
    if (name) {
      await User.update({ name }, { where: { id: req.user.id } });
    }

    // Fetch the updated, fully populated record
    const updatedProfile = await Doctor.findByPk(doctor.id, {
      include: [{ association: 'user', attributes: ['id', 'name', 'email', 'role'] }]
    });

    res.status(200).json({
      success: true,
      message: 'Doctor profile updated successfully',
      doctor: updatedProfile
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDoctors,
  getDoctorById,
  updateDoctorProfile
};

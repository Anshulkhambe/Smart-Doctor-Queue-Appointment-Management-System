const Patient = require('../models/Patient');
const User = require('../models/User');

/**
 * Gets the authenticated patient's profile details.
 */
const getPatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({
      where: { userId: req.user.id },
      include: [{ association: 'user', attributes: ['id', 'name', 'email', 'role'] }]
    });
      
    if (!patient) {
      res.status(404);
      return next(new Error('Patient profile not found'));
    }

    res.status(200).json({
      success: true,
      patient
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates the authenticated patient's profile details.
 * Also permits name updates on the linked User account.
 */
const updatePatientProfile = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    
    if (!patient) {
      res.status(404);
      return next(new Error('Patient profile not found'));
    }

    const { phone, age, gender, name } = req.body;
    
    // Update Patient model fields
    if (phone) patient.phone = phone;
    if (age !== undefined) patient.age = parseInt(age, 10);
    if (gender) patient.gender = gender;

    await patient.save();

    // Update User model fields if name is changed
    if (name) {
      await User.update({ name }, { where: { id: req.user.id } });
    }

    // Retrieve the fully populated record
    const updatedProfile = await Patient.findByPk(patient.id, {
      include: [{ association: 'user', attributes: ['id', 'name', 'email', 'role'] }]
    });

    res.status(200).json({
      success: true,
      message: 'Patient profile updated successfully',
      patient: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPatientProfile,
  updatePatientProfile
};

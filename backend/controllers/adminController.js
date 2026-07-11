const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const sequelize = require('../config/db').sequelize;

/**
 * Returns formatted YYYY-MM-DD date string for today (server local time).
 */
const getTodayDateString = () => {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const year = d.getFullYear();
  return `${year}-${month}-${day}`;
};

/**
 * Compiles dashboard metrics, trend analytics, and specialization breakdowns.
 */
const getAdminDashboardStats = async (req, res, next) => {
  try {
    const today = getTodayDateString();

    const [
      totalDoctors,
      totalPatients,
      todayAppointments,
      pendingAppointments
    ] = await Promise.all([
      Doctor.count(),
      Patient.count(),
      Appointment.count({ where: { date: today } }),
      Appointment.count({ where: { status: 'Pending' } })
    ]);

    // Analytics: Retrieve daily booking volumes for the last 7 dates
    const appointmentTrends = await Appointment.findAll({
      attributes: [
        ['date', '_id'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['date'],
      order: [['date', 'ASC']],
      limit: 7,
      raw: true
    });

    // Analytics: Retrieve doctor specialization distribution
    const doctorSpecializations = await Doctor.findAll({
      attributes: [
        ['specialization', '_id'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['specialization'],
      raw: true
    });

    res.status(200).json({
      success: true,
      stats: {
        totalDoctors,
        totalPatients,
        todayAppointments,
        pendingAppointments,
        appointmentTrends: appointmentTrends.map(t => ({ date: t._id, count: t.count })),
        specializationBreakdown: doctorSpecializations.map(s => ({ specialty: s._id, count: s.count }))
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Retrieves a list of all patients (Admin only).
 */
const getAllPatients = async (req, res, next) => {
  try {
    const patients = await Patient.findAll({
      include: [{ association: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: patients.length,
      patients
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a doctor and their base User account.
 * Soft-cancels any upcoming appointments scheduled with this doctor.
 */
const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      res.status(404);
      return next(new Error('Doctor profile not found'));
    }

    const doctorUserId = doctor.userId;
    const doctorId = doctor.id;

    // Delete base User first (cascades or is handled here), then Doctor profile
    await User.destroy({ where: { id: doctorUserId } });
    await Doctor.destroy({ where: { id: doctorId } });

    // Cancel all pending/active appointments for this doctor
    await Appointment.update(
      { status: 'Cancelled' },
      {
        where: {
          doctorId: doctorId,
          status: ['Pending', 'Confirmed', 'In-Progress']
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Doctor profile and user account deleted successfully. Future appointments cancelled.'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a patient and their base User account.
 * Soft-cancels any upcoming appointments booked by this patient.
 */
const deletePatient = async (req, res, next) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) {
      res.status(404);
      return next(new Error('Patient profile not found'));
    }

    const patientUserId = patient.userId;
    const patientId = patient.id;

    // Delete base User first, then Patient profile
    await User.destroy({ where: { id: patientUserId } });
    await Patient.destroy({ where: { id: patientId } });

    // Cancel all pending/active appointments for this patient
    await Appointment.update(
      { status: 'Cancelled' },
      {
        where: {
          patientId: patientId,
          status: ['Pending', 'Confirmed', 'In-Progress']
        }
      }
    );

    res.status(200).json({
      success: true,
      message: 'Patient profile and user account deleted successfully. Appointments cancelled.'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Deletes a user by their User ID. Depending on their role, cleans up their profile:
 * - If Doctor: Deletes Doctor record, cascades/cancels active appointments, deletes User account.
 * - If Patient: Deletes Patient record, cascades/cancels active appointments, deletes User account.
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      res.status(404);
      return next(new Error('User not found'));
    }

    const userId = user.id;

    if (user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ where: { userId } });
      if (doctor) {
        const doctorId = doctor.id;
        // Delete Doctor profile
        await Doctor.destroy({ where: { id: doctorId } });
        // Cancel all pending/active appointments for this doctor
        await Appointment.update(
          { status: 'Cancelled' },
          {
            where: {
              doctorId: doctorId,
              status: ['Pending', 'Confirmed', 'In-Progress']
            }
          }
        );
      }
    } else if (user.role === 'Patient') {
      const patient = await Patient.findOne({ where: { userId } });
      if (patient) {
        const patientId = patient.id;
        // Delete Patient profile
        await Patient.destroy({ where: { id: patientId } });
        // Cancel all pending/active appointments for this patient
        await Appointment.update(
          { status: 'Cancelled' },
          {
            where: {
              patientId: patientId,
              status: ['Pending', 'Confirmed', 'In-Progress']
            }
          }
        );
      }
    }

    // Finally delete the base User account
    await User.destroy({ where: { id: userId } });

    res.status(200).json({
      success: true,
      message: 'User account and associated profile deleted successfully.'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggles a doctor's active availability by Doctor ID.
 */
const toggleDoctorAvailability = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) {
      res.status(404);
      return next(new Error('Doctor profile not found'));
    }

    const { availability } = req.body;
    if (availability !== undefined) {
      doctor.availability = availability === 'true' || availability === true;
      await doctor.save();
    }

    res.status(200).json({
      success: true,
      message: 'Doctor availability updated successfully',
      doctor
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboardStats,
  getAllPatients,
  deleteDoctor,
  deletePatient,
  deleteUser,
  toggleDoctorAvailability
};

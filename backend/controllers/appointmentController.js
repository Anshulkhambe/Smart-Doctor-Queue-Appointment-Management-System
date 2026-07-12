const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const { updateDoctorQueueState } = require('../utils/queueHelpers');
const { getIO } = require('../socket/socketHandler');
const { sendAppointmentConfirmedEmail, sendAppointmentCancelledEmail } = require('../utils/mailService');

/**
 * Books a new appointment.
 * Automatically computes queue number and estimated wait times, and triggers socket updates.
 */
const bookAppointment = async (req, res, next) => {
  const { doctorId, date, time } = req.body;

  try {
    // 1. Fetch patient profile linked to authenticated user
    const patientProfile = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patientProfile) {
      res.status(400);
      return next(new Error('Patient profile not found. Please complete profile registration first.'));
    }

    // 2. Fetch doctor profile and verify availability
    const doctorProfile = await Doctor.findByPk(doctorId, {
      include: [{ association: 'user', attributes: ['name'] }]
    });
    if (!doctorProfile) {
      res.status(404);
      return next(new Error('Doctor not found'));
    }

    if (!doctorProfile.availability) {
      res.status(400);
      return next(new Error('Doctor is not available for appointments at this time'));
    }

    // 3. Prevent duplicate bookings for the same patient with the same doctor on the same day
    const duplicateAppt = await Appointment.findOne({
      where: {
        patientId: patientProfile.id,
        doctorId: doctorId,
        date: date,
        status: ['Pending', 'Confirmed', 'In-Progress']
      }
    });

    if (duplicateAppt) {
      res.status(400);
      return next(new Error('You already have an active appointment booked with this doctor on this date'));
    }

    // 4. Calculate Queue Number: count all existing appointments for this doctor on this day
    const dailyApptsCount = await Appointment.count({
      where: {
        doctorId: doctorId,
        date: date
      }
    });
    const queueNumber = dailyApptsCount + 1;

    // 5. Calculate estimated wait time (count active patients ahead in queue)
    const activeAhead = await Appointment.count({
      where: {
        doctorId: doctorId,
        date: date,
        status: ['Pending', 'Confirmed', 'In-Progress']
      }
    });
    
    // Default wait calculation: 15 mins per patient ahead
    const estimatedWait = activeAhead * 15;

    // 6. Create the Appointment
    const appointment = await Appointment.create({
      patientId: patientProfile.id,
      doctorId: doctorId,
      date,
      time,
      queueNumber,
      estimatedWait,
      status: 'Confirmed' // Bookings are immediately Confirmed for simplicity unless specified
    });

    // 7. Recalculate daily wait times & broadcast queue status update
    await updateDoctorQueueState(doctorId, date);

    // 8. Create database notification for patient
    const notif = await Notification.create({
      userId: req.user.id,
      message: `Your appointment with Dr. ${doctorProfile.userId.name} on ${date} at ${time} is Confirmed. Queue Number: ${queueNumber}.`
    });

    // Push socket notification directly to patient
    try {
      const io = getIO();
      io.to(`user:${req.user.id}`).emit('notification', {
        id: notif.id,
        message: notif.message,
        read: false,
        createdAt: notif.createdAt
      });
    } catch (socketErr) {
      console.warn('[AppointmentController] Failed to push notification over socket:', socketErr.message);
    }

    // Trigger mock email notification (asynchronously to prevent request timeout)
    try {
      const patientEmail = req.user.email;
      const patientName = req.user.name;
      const doctorName = doctorProfile.userId.name;
      if (patientEmail) {
        sendAppointmentConfirmedEmail(patientEmail, patientName, doctorName, date, time, queueNumber)
          .catch(emailErr => console.error('[AppointmentController] Failed to send confirmation email:', emailErr.message));
      }
    } catch (emailErr) {
      console.error('[AppointmentController] Failed to send confirmation email:', emailErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Gets all appointments based on user role.
 * - Patients: gets their personal appointments.
 * - Doctors: gets their booked schedules.
 * - Admins: gets all system appointments.
 */
const getAppointments = async (req, res, next) => {
  try {
    let appointments;

    if (req.user.role === 'Patient') {
      const patientProfile = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patientProfile) {
        return res.status(200).json({ success: true, count: 0, appointments: [] });
      }
      appointments = await Appointment.findAll({
        where: { patientId: patientProfile.id },
        include: [
          {
            association: 'doctor',
            include: [{ association: 'user', attributes: ['name', 'email'] }]
          }
        ],
        order: [['date', 'DESC'], ['time', 'DESC']]
      });

    } else if (req.user.role === 'Doctor') {
      const doctorProfile = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctorProfile) {
        return res.status(200).json({ success: true, count: 0, appointments: [] });
      }
      appointments = await Appointment.findAll({
        where: { doctorId: doctorProfile.id },
        include: [
          {
            association: 'patient',
            include: [{ association: 'user', attributes: ['name', 'email'] }]
          }
        ],
        order: [['date', 'DESC'], ['time', 'DESC']]
      });

    } else if (req.user.role === 'Admin') {
      appointments = await Appointment.findAll({
        include: [
          {
            association: 'patient',
            include: [{ association: 'user', attributes: ['name', 'email'] }]
          },
          {
            association: 'doctor',
            include: [{ association: 'user', attributes: ['name', 'email'] }]
          }
        ],
        order: [['date', 'DESC'], ['time', 'DESC']]
      });
    }

    res.status(200).json({
      success: true,
      count: appointments.length,
      appointments
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Updates an appointment's details or status.
 * Triggers queue recalculations if status transitions.
 */
const updateAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      res.status(404);
      return next(new Error('Appointment not found'));
    }

    const { status, date, time, estimatedWait } = req.body;
    const oldStatus = appointment.status;

    // Apply updates
    if (status) appointment.status = status;
    if (date) appointment.date = date;
    if (time) appointment.time = time;
    if (estimatedWait !== undefined) appointment.estimatedWait = estimatedWait;

    await appointment.save();

    // Trigger queue update if status changes or date shifts
    if (status !== oldStatus || date) {
      await updateDoctorQueueState(appointment.doctorId, appointment.date);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      appointment
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Cancels an appointment (Soft-delete: changes status to 'Cancelled').
 * Recalculates wait times and broadcasts updates.
 */
const cancelAppointment = async (req, res, next) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          association: 'doctor',
          include: [{ association: 'user', attributes: ['name'] }]
        },
        {
          association: 'patient',
          include: [{ association: 'user', attributes: ['name', 'email'] }]
        }
      ]
    });

    if (!appointment) {
      res.status(404);
      return next(new Error('Appointment not found'));
    }

    // Auth verification: ensure patients can only cancel their own appointments
    if (req.user.role === 'Patient') {
      const patientProfile = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patientProfile || appointment.patientId.toString() !== patientProfile.id.toString()) {
        res.status(403);
        return next(new Error('You are not authorized to cancel this appointment'));
      }
    }

    // Set status to Cancelled
    appointment.status = 'Cancelled';
    await appointment.save();

    // Recalculate daily wait times & broadcast queue status update
    await updateDoctorQueueState(appointment.doctorId, appointment.date);

    // Create DB notification
    let notificationUser = req.user.id;
    // If doctor or admin cancelled, notify the patient user account
    if (req.user.role !== 'Patient') {
      const p = await Patient.findByPk(appointment.patientId);
      if (p) notificationUser = p.userId;
    }

    const notif = await Notification.create({
      userId: notificationUser,
      message: `Your appointment with Dr. ${appointment.doctor.userId.name} on ${appointment.date} has been Cancelled.`
    });

    // Push socket notification directly to user room
    try {
      const io = getIO();
      io.to(`user:${notificationUser}`).emit('notification', {
        id: notif.id,
        message: notif.message,
        read: false,
        createdAt: notif.createdAt
      });
    } catch (socketErr) {
      console.warn('[AppointmentController] Failed to push cancellation notification:', socketErr.message);
    }

    // Trigger mock email notification (asynchronously to prevent request timeout)
    try {
      const patientUser = appointment.patient?.userId;
      if (patientUser && patientUser.email) {
        sendAppointmentCancelledEmail(
          patientUser.email,
          patientUser.name,
          appointment.doctor.userId.name,
          appointment.date,
          appointment.time
        ).catch(emailErr => console.error('[AppointmentController] Failed to send cancellation email:', emailErr.message));
      }
    } catch (emailErr) {
      console.error('[AppointmentController] Failed to send cancellation email:', emailErr.message);
    }

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointment
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  bookAppointment,
  getAppointments,
  updateAppointment,
  cancelAppointment
};

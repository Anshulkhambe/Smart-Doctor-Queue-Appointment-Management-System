const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Notification = require('../models/Notification');
const { updateDoctorQueueState } = require('../utils/queueHelpers');
const { getIO } = require('../socket/socketHandler');
const { sendDoctorDelayedEmail } = require('../utils/mailService');

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
 * Retrieves daily queue statistics and current state for a specific doctor.
 * Supports a query parameter 'date' (defaults to today).
 */
const getQueueStatus = async (req, res, next) => {
  const { doctorId } = req.params;
  const date = req.query.date || getTodayDateString();

  try {
    // 1. Fetch doctor details
    const doctor = await Doctor.findByPk(doctorId, {
      include: [{ association: 'user', attributes: ['id', 'name'] }]
    });
    if (!doctor) {
      res.status(404);
      return next(new Error('Doctor profile not found'));
    }

    // 2. Fetch all appointments for the date
    const allAppointments = await Appointment.findAll({
      where: {
        doctorId: doctorId,
        date: date
      },
      order: [['queueNumber', 'ASC']],
      include: [
        {
          association: 'patient',
          include: [{ association: 'user', attributes: ['id', 'name'] }]
        }
      ]
    });

    const activeAppointments = allAppointments.filter(a =>
      a.status === 'Pending' || a.status === 'Confirmed' || a.status === 'In-Progress'
    );

    const currentAppt = activeAppointments.find(a => a.status === 'In-Progress') || null;
    const nextAppt = activeAppointments.find(a => a.status === 'Confirmed' || a.status === 'Pending') || null;

    res.status(200).json({
      success: true,
      data: {
        doctorId,
        doctorName: doctor.userId.name,
        date,
        totalActive: activeAppointments.length,
        currentPatient: currentAppt ? {
          id: currentAppt.id,
          queueNumber: currentAppt.queueNumber,
          patientName: currentAppt.patient?.userId?.name || 'Patient',
          time: currentAppt.time
        } : null,
        nextPatient: nextAppt ? {
          id: nextAppt.id,
          queueNumber: nextAppt.queueNumber,
          patientName: nextAppt.patient?.userId?.name || 'Patient',
          time: nextAppt.time
        } : null,
        appointments: allAppointments.map(a => ({
          id: a.id,
          queueNumber: a.queueNumber,
          status: a.status,
          time: a.time,
          estimatedWait: a.estimatedWait,
          patientName: a.patient?.userId?.name || 'Patient'
        }))
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * Modifies doctor queue states.
 * Restricted to Doctor (own profile updates) and Admins.
 * Actions:
 * - 'next': Completes active patient, shifts next queue member to In-Progress.
 * - 'delay': Shifts all upcoming patient wait times by delayMinutes.
 */
const updateQueue = async (req, res, next) => {
  const { action, delayMinutes } = req.body;
  const date = req.body.date || getTodayDateString();

  try {
    let doctorId;
    let doctorName = 'Doctor';
    
    // Resolve doctor context
    if (req.user.role === 'Doctor') {
      const doctorProfile = await Doctor.findOne({
        where: { userId: req.user.id },
        include: [{ association: 'user', attributes: ['id', 'name'] }]
      });
      if (!doctorProfile) {
        res.status(450);
        return next(new Error('Doctor profile not found'));
      }
      doctorId = doctorProfile.id;
      doctorName = doctorProfile.userId.name;
    } else if (req.user.role === 'Admin') {
      doctorId = req.body.doctorId;
      if (!doctorId) {
        res.status(400);
        return next(new Error('doctorId is required for admin actions'));
      }
      const doc = await Doctor.findByPk(doctorId, {
        include: [{ association: 'user', attributes: ['id', 'name'] }]
      });
      if (doc) doctorName = doc.userId.name;
    } else {
      res.status(403);
      return next(new Error('Unauthorized to perform this queue adjustment'));
    }

    if (action === 'next') {
      // 1. Mark currently active patient as Completed
      const currentPatient = await Appointment.findOne({
        where: {
          doctorId: doctorId,
          date: date,
          status: 'In-Progress'
        }
      });

      if (currentPatient) {
        currentPatient.status = 'Completed';
        await currentPatient.save();
      }

      // 2. Advance next patient to In-Progress status
      const nextPatient = await Appointment.findOne({
        where: {
          doctorId: doctorId,
          date: date,
          status: ['Confirmed', 'Pending']
        },
        order: [['queueNumber', 'ASC']]
      });

      if (nextPatient) {
        nextPatient.status = 'In-Progress';
        await nextPatient.save();
      }

      // 3. Recalculate wait times & broadcast
      const updatedQueue = await updateDoctorQueueState(doctorId, date);

      res.status(200).json({
        success: true,
        message: 'Queue advanced to next patient successfully',
        queue: updatedQueue
      });

    } else if (action === 'delay') {
      const delayMins = parseInt(delayMinutes, 10) || 15;
      
      // 1. Update queue times with delay
      const updatedQueue = await updateDoctorQueueState(doctorId, date, delayMins);

      // 2. Alert all upcoming active patients in queue
      const activeAppts = await Appointment.findAll({
        where: {
          doctorId: doctorId,
          date: date,
          status: ['Pending', 'Confirmed']
        },
        include: [
          {
            association: 'patient',
            include: [{ association: 'user', attributes: ['id', 'name', 'email'] }]
          }
        ]
      });

      const io = getIO();
      for (let i = 0; i < activeAppts.length; i++) {
        const appt = activeAppts[i];
        if (appt.patient && appt.patient.userId) {
          const userId = appt.patient.userId.id || appt.patient.userId;
          const patientEmail = appt.patient.userId.email;
          const patientName = appt.patient.userId.name;

          const notif = await Notification.create({
            userId: userId,
            message: `Dr. ${doctorName} is running ${delayMins} minutes late. Your estimated waiting time has been updated.`
          });

          // Socket push to patient
          try {
            io.to(`user:${userId}`).emit('notification', {
              id: notif.id,
              message: notif.message,
              read: false,
              createdAt: notif.createdAt
            });
          } catch (socketErr) {
            console.warn('[QueueController] Failed to push delay alert:', socketErr.message);
          }

          // Trigger email alert
          try {
            if (patientEmail) {
              await sendDoctorDelayedEmail(patientEmail, patientName, doctorName, delayMins);
            }
          } catch (emailErr) {
            console.error('[QueueController] Failed to send delay email:', emailErr.message);
          }
        }
      }

      res.status(200).json({
        success: true,
        message: `Queue delayed by ${delayMins} minutes. Patients alerted.`,
        queue: updatedQueue
      });

    } else {
      res.status(400);
      return next(new Error('Invalid action. Supported: "next" or "delay".'));
    }

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQueueStatus,
  updateQueue
};

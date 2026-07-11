const Appointment = require('../models/Appointment');
const Notification = require('../models/Notification');
const { getIO } = require('../socket/socketHandler');
const { sendYourTurnNextEmail } = require('./mailService');
const { Op } = require('sequelize');

const CONSULTATION_TIME_MINS = 15; // default average duration per consultation

/**
 * Recalculates estimated wait times for all active appointments for a doctor on a specific date.
 * Saves values, triggers notifications for the next patient, and broadcasts updates via Socket.io.
 * 
 * @param {string|number} doctorId - Doctor's ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} delayMinutes - Optional minutes to delay everyone in the queue
 */
const updateDoctorQueueState = async (doctorId, date, delayMinutes = 0) => {
  try {
    // 1. Get all appointments for the date
    const allAppointments = await Appointment.findAll({
      where: {
        doctorId: doctorId,
        date: date
      },
      order: [['queueNumber', 'ASC']],
      include: [
        {
          association: 'patient',
          include: [{ association: 'user', attributes: ['id', 'name', 'email', 'role'] }]
        },
        {
          association: 'doctor',
          include: [{ association: 'user', attributes: ['id', 'name'] }]
        }
      ]
    });

    const activeAppointments = allAppointments.filter(a =>
      a.status === 'Pending' || a.status === 'Confirmed' || a.status === 'In-Progress'
    );

    const currentAppt = activeAppointments.find(a => a.status === 'In-Progress') || null;
    
    // 2. Recalculate wait times
    let patientsAheadCount = 0;
    
    for (let i = 0; i < activeAppointments.length; i++) {
      const appt = activeAppointments[i];
      
      if (appt.status === 'In-Progress') {
        appt.estimatedWait = 0;
      } else {
        appt.estimatedWait = (patientsAheadCount * CONSULTATION_TIME_MINS) + delayMinutes;
        patientsAheadCount++;
      }
      
      await appt.save();
    }

    // 3. Resolve the next patient in line
    const nextAppt = activeAppointments.find(a => a.status === 'Confirmed' || a.status === 'Pending') || null;

    // Trigger "Your Turn is Next" notification if appropriate
    if (nextAppt && nextAppt.patient && nextAppt.patient.userId) {
      const userId = nextAppt.patient.userId.id || nextAppt.patient.userId;
      
      // Prevent duplicate notification spikes within a 15-minute window
      const alreadyNotified = await Notification.findOne({
        where: {
          userId: userId,
          message: { [Op.like]: '%Your turn is next%' },
          createdAt: { [Op.gte]: new Date(Date.now() - 15 * 60 * 1000) }
        }
      });

      if (!alreadyNotified) {
        const notif = await Notification.create({
          userId: userId,
          message: `Your turn is next! Please be ready. Doctor is preparing for your consultation.`
        });

        // Push via Socket.io directly to user room
        try {
          const io = getIO();
          io.to(`user:${userId}`).emit('notification', {
            id: notif.id,
            message: notif.message,
            read: false,
            createdAt: notif.createdAt
          });
        } catch (socketErr) {
          console.warn('[QueueHelper] Failed to push notification over socket:', socketErr.message);
        }

        // Trigger mock email notification
        try {
          // If nextAppt.patient.userId is populated user object
          const patientUser = nextAppt.patient.userId;
          const patientEmail = patientUser.email;
          const patientName = patientUser.name;
          const doctorName = nextAppt.doctor.userId?.name || 'Doctor';
          if (patientEmail) {
            sendYourTurnNextEmail(patientEmail, patientName, doctorName);
          }
        } catch (emailErr) {
          console.error('[QueueHelper] Failed to send next turn email:', emailErr.message);
        }
      }
    }

    // 4. Construct live queue status structure
    const queueData = {
      doctorId,
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
    };

    // Broadcast update to doctor room
    try {
      const io = getIO();
      io.to(`doctor:${doctorId}`).emit('queue_updated', queueData);
    } catch (socketErr) {
      console.warn('[QueueHelper] Failed to emit queue update:', socketErr.message);
    }

    return queueData;
  } catch (error) {
    console.error('[QueueHelper] Error updating queue state:', error);
    throw error;
  }
};

module.exports = {
  updateDoctorQueueState,
  CONSULTATION_TIME_MINS
};

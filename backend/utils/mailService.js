const nodemailer = require('nodemailer');

let transporter = null;

/**
 * Initializes and returns the Nodemailer transporter.
 * If credentials are not configured in environment variables, it generates an Ethereal SMTP test account on the fly.
 */
const getTransporter = async () => {
  if (transporter) return transporter;

  try {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT, 10) || 587,
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
      console.log('[Email] Transporter initialized using environment settings.');
    } else {
      // Ethereal mock fallback
      console.log('[Email] Missing email credentials in .env. Creating temporary Ethereal account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`[Email] Ethereal account generated: ${testAccount.user}`);
    }
    return transporter;
  } catch (error) {
    console.error('[Email] Failed to build transporter. Falling back to console logger:', error.message);
    
    // Fallback logging transporter
    transporter = {
      sendMail: async (options) => {
        console.log('\n===== [MOCK EMAIL LOGGER FALLBACK] =====');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Content: ${options.text}`);
        console.log('=========================================\n');
        return { messageId: 'mock-console-id' };
      }
    };
    return transporter;
  }
};

/**
 * Core send helper
 */
const sendMail = async (to, subject, text, html) => {
  try {
    const activeTransporter = await getTransporter();
    
    const info = await activeTransporter.sendMail({
      from: `"Smart Hospital Portal" <no-reply@smarthospital.com>`,
      to,
      subject,
      text,
      html
    });

    console.log(`[Email] Message sent successfully. ID: ${info.messageId}`);
    
    // Log preview link if using Ethereal
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`[Email] Ethereal inbox URL for this message: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error('[Email] sendMail encountered an error:', error.message);
  }
};

/**
 * Helper to notify patient of appointment confirmation.
 */
const sendAppointmentConfirmedEmail = async (patientEmail, patientName, doctorName, date, time, queueNumber) => {
  const subject = `Appointment Confirmed - Dr. ${doctorName}`;
  const text = `Hello ${patientName},\n\nYour appointment with Dr. ${doctorName} on ${date} at ${time} has been confirmed. Your Queue Number is: ${queueNumber}.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #0284c7; margin-bottom: 20px;">Appointment Confirmed</h2>
      <p>Hello <strong>${patientName}</strong>,</p>
      <p>Your appointment has been successfully scheduled. Here are the details:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Doctor</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">Dr. ${doctorName}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Date</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${date}</td>
        </tr>
        <tr style="background-color: #f8fafc;">
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Time Slot</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0;">${time}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #10b981;">Queue Number</td>
          <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; color: #10b981; font-size: 1.1em;">#${queueNumber}</td>
        </tr>
      </table>
      <p>Please arrive 15 minutes before your scheduled slot. You can check your live queue status on the patient dashboard.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;" />
      <p style="font-size: 0.85em; color: #64748b;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  `;
  return await sendMail(patientEmail, subject, text, html);
};

/**
 * Helper to notify patient of appointment cancellation.
 */
const sendAppointmentCancelledEmail = async (patientEmail, patientName, doctorName, date, time) => {
  const subject = `Appointment Cancelled - Dr. ${doctorName}`;
  const text = `Hello ${patientName},\n\nYour appointment with Dr. ${doctorName} on ${date} at ${time} has been cancelled.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #ef4444; margin-bottom: 20px;">Appointment Cancelled</h2>
      <p>Hello <strong>${patientName}</strong>,</p>
      <p>Your appointment with <strong>Dr. ${doctorName}</strong> on <strong>${date}</strong> at <strong>${time}</strong> has been cancelled.</p>
      <p>If you did not initiate this change or need to reschedule, please visit our online portal to book another slot.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;" />
      <p style="font-size: 0.85em; color: #64748b;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  `;
  return await sendMail(patientEmail, subject, text, html);
};

/**
 * Helper to notify patient that the doctor is running late.
 */
const sendDoctorDelayedEmail = async (patientEmail, patientName, doctorName, delayMinutes) => {
  const subject = `Delay Update - Dr. ${doctorName}`;
  const text = `Hello ${patientName},\n\nDr. ${doctorName} is running approximately ${delayMinutes} minutes late today. Your estimated waiting time has been adjusted.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
      <h2 style="color: #f59e0b; margin-bottom: 20px;">Schedule Delay Update</h2>
      <p>Hello <strong>${patientName}</strong>,</p>
      <p>Please be advised that <strong>Dr. ${doctorName}</strong> is running approximately <strong>${delayMinutes} minutes late</strong> today.</p>
      <p>We have automatically updated your estimated queue wait time in your patient dashboard. You may plan your arrival accordingly to minimize your waiting duration at the clinic.</p>
      <p>We apologize for the inconvenience and appreciate your understanding.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;" />
      <p style="font-size: 0.85em; color: #64748b;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  `;
  return await sendMail(patientEmail, subject, text, html);
};

/**
 * Helper to notify patient their turn is next.
 */
const sendYourTurnNextEmail = async (patientEmail, patientName, doctorName) => {
  const subject = `Your Turn is Next - Dr. ${doctorName}`;
  const text = `Hello ${patientName},\n\nYour turn is next with Dr. ${doctorName}! Please stand by.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f0fdf4; border-left: 5px solid #10b981;">
      <h2 style="color: #065f46; margin-bottom: 20px;">Your Turn is Next!</h2>
      <p>Hello <strong>${patientName}</strong>,</p>
      <p>Great news! The doctor is completing the current patient, and you are <strong>next in line</strong> for your consultation with <strong>Dr. ${doctorName}</strong>.</p>
      <p>Please make sure you are in the waiting lobby or prepared for your call.</p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin-top: 30px; margin-bottom: 20px;" />
      <p style="font-size: 0.85em; color: #64748b;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  `;
  return await sendMail(patientEmail, subject, text, html);
};

module.exports = {
  sendAppointmentConfirmedEmail,
  sendAppointmentCancelledEmail,
  sendDoctorDelayedEmail,
  sendYourTurnNextEmail
};

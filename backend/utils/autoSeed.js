const { User, Doctor, Patient } = require('../models');

/**
 * Automatically seeds the database with default accounts (Admin, Doctor, Patient)
 * if no users exist in the database.
 */
const autoSeed = async () => {
  try {
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('[Auto-Seeder] Database already contains data. Skipping auto-seeding.');
      return;
    }

    console.log('[Auto-Seeder] Database is empty. Seeding default accounts...');

    // 1. Create Admin Account
    const adminUser = await User.create({
      name: 'Hospital Administrator',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin'
    });
    console.log('[Auto-Seeder] Created Admin User: admin@example.com / password123');

    // 2. Create Doctor Account
    const doctorUser = await User.create({
      name: 'Elizabeth Blackwell',
      email: 'doctor@example.com',
      password: 'password123',
      role: 'Doctor'
    });

    await Doctor.create({
      userId: doctorUser.id,
      specialization: 'Cardiology',
      experience: 12,
      clinic: 'City Cardiology Center, Plaza 4',
      fees: 120,
      workingHours: {
        start: '09:00',
        end: '17:00'
      },
      availability: true
    });
    console.log('[Auto-Seeder] Created Doctor User: doctor@example.com / password123');

    // 3. Create Patient Account
    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@example.com',
      password: 'password123',
      role: 'Patient'
    });

    await Patient.create({
      userId: patientUser.id,
      phone: '555-0199',
      age: 32,
      gender: 'Male'
    });
    console.log('[Auto-Seeder] Created Patient User: patient@example.com / password123');
    console.log('[Auto-Seeder] Auto-seeding completed successfully.');

  } catch (error) {
    console.error('[Auto-Seeder] Error seeding default accounts:', error);
  }
};

module.exports = autoSeed;

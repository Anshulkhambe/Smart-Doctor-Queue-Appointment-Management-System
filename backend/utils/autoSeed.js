const { User, Doctor, Patient } = require('../models');

/**
 * Automatically seeds the database with default accounts (Admin, Doctor, Patient)
 * checking each individually to ensure they exist.
 */
const autoSeed = async () => {
  try {
    // 1. Create Admin Account if not present
    const adminExists = await User.findOne({ where: { email: 'admin@example.com' } });
    if (!adminExists) {
      await User.create({
        name: 'Hospital Administrator',
        email: 'admin@example.com',
        password: 'password123',
        role: 'Admin'
      });
      console.log('[Auto-Seeder] Created Admin User: admin@example.com / password123');
    } else {
      console.log('[Auto-Seeder] Admin user already exists.');
    }

    // 2. Create Doctor Account if not present
    const doctorExists = await User.findOne({ where: { email: 'doctor@example.com' } });
    if (!doctorExists) {
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
    } else {
      console.log('[Auto-Seeder] Doctor user already exists.');
    }

    // 3. Create Patient Account if not present
    const patientExists = await User.findOne({ where: { email: 'patient@example.com' } });
    if (!patientExists) {
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
    } else {
      console.log('[Auto-Seeder] Patient user already exists.');
    }

    console.log('[Auto-Seeder] Auto-seeding check completed.');

  } catch (error) {
    console.error('[Auto-Seeder] Error seeding default accounts:', error);
  }
};

module.exports = autoSeed;

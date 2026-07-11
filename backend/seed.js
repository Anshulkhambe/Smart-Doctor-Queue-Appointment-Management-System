const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('./config/db');
const { sequelize, User, Doctor, Patient, Appointment, Notification } = require('./models');

const seed = async () => {
  try {
    // 1. Initialize and authenticate connection
    await connectDB();
    console.log('[Seeder] Connected to MySQL database...');

    // 2. Clean/Drop existing tables and recreate them
    await sequelize.sync({ force: true });
    console.log('[Seeder] Cleared and rebuilt all existing tables successfully.');

    // 3. Create Admin Account
    const adminUser = await User.create({
      name: 'Hospital Administrator',
      email: 'admin@example.com',
      password: 'password123',
      role: 'Admin'
    });
    console.log('[Seeder] Created Admin User: admin@example.com / password123');

    // 4. Create Doctor Account
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
    console.log('[Seeder] Created Doctor User: doctor@example.com / password123');

    // 5. Create Patient Account
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
    console.log('[Seeder] Created Patient User: patient@example.com / password123');

    console.log('[Seeder] Database seeding completed successfully.');
    process.exit(0);
  } catch (err) {
    console.error('[Seeder] Seeding error encountered:', err);
    process.exit(1);
  }
};

seed();

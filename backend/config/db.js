const { Sequelize } = require('sequelize');
const mysql = require('mysql2/promise');

const host = process.env.MYSQL_HOST || 'localhost';
const port = process.env.MYSQL_PORT || 3306;
const user = process.env.MYSQL_USER || 'root';
const password = process.env.MYSQL_PASSWORD || 'anshul@ak47#';
const database = process.env.MYSQL_DATABASE || 'smart_doctor_queue';

const sequelize = new Sequelize(database, user, password, {
  host,
  port,
  dialect: 'mysql',
  logging: false, // Set to console.log in development if query logs are desired
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

/**
 * Establishes connection to MySQL. Checks for database existence and creates it if not found,
 * then initiates connection authenticate and table sync.
 */
const connectDB = async () => {
  try {
    // 1. Ensure the database exists
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // 2. Authenticate database connection
    await sequelize.authenticate();
    console.log(`[Database] MySQL Connected: ${host}:${port}/${database}`);

    // 3. Initialize Associations and Sync models
    const { initAssociations } = require('../models');
    initAssociations();

    // Sync database schemas
    await sequelize.sync({ alter: true });
    console.log('[Database] MySQL schemas synchronized successfully.');
  } catch (error) {
    console.error(`[Database] MySQL connection failure: ${error.message}`);
    process.exit(1);
  }
};

// Expose sequelize instance as property
connectDB.sequelize = sequelize;

module.exports = connectDB;

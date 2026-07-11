const { Sequelize } = require('sequelize');

let sequelize;

if (process.env.DATABASE_URL) {
  // If DATABASE_URL is set (standard for Render PostgreSQL), connect using the URL
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'false' ? false : {
        require: true,
        rejectUnauthorized: false // Required for Render PostgreSQL connection from external sources
      }
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
} else {
  // Fall back to MySQL configuration for local development
  const host = process.env.MYSQL_HOST || 'localhost';
  const port = process.env.MYSQL_PORT || 3306;
  const user = process.env.MYSQL_USER || 'root';
  const password = process.env.MYSQL_PASSWORD || 'anshul@ak47#';
  const database = process.env.MYSQL_DATABASE || 'smart_doctor_queue';

  sequelize = new Sequelize(database, user, password, {
    host,
    port,
    dialect: 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  });
}

/**
 * Establishes connection to the database. Checks for database existence and creates it if using MySQL,
 * then initiates connection authenticate and table sync.
 */
const connectDB = async () => {
  try {
    // 1. Ensure the database exists (MySQL only)
    if (!process.env.DATABASE_URL) {
      const mysql = require('mysql2/promise');
      const host = process.env.MYSQL_HOST || 'localhost';
      const port = process.env.MYSQL_PORT || 3306;
      const user = process.env.MYSQL_USER || 'root';
      const password = process.env.MYSQL_PASSWORD || 'anshul@ak47#';
      const database = process.env.MYSQL_DATABASE || 'smart_doctor_queue';

      const connection = await mysql.createConnection({
        host,
        port,
        user,
        password
      });
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
      await connection.end();
    }

    // 2. Authenticate database connection
    await sequelize.authenticate();
    const dialect = sequelize.getDialect();
    console.log(`[Database] Database Connected: ${dialect}`);

    // 3. Initialize Associations and Sync models
    const { initAssociations } = require('../models');
    initAssociations();

    // Sync database schemas
    await sequelize.sync({ alter: true });
    console.log(`[Database] ${dialect} schemas synchronized successfully.`);
  } catch (error) {
    console.error(`[Database] Database connection failure: ${error.message}`);
    process.exit(1);
  }
};

// Expose sequelize instance as property
connectDB.sequelize = sequelize;

module.exports = connectDB;

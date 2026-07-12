const { Sequelize } = require('sequelize');

let sequelize;
const databaseUrl = process.env.DATABASE_URL ? process.env.DATABASE_URL.trim() : '';

if (databaseUrl && databaseUrl.includes('://')) {
  // Connect using a connection string URL (supports postgres:// and mysql://)
  const isPostgres = databaseUrl.startsWith('postgres') || databaseUrl.startsWith('postgresql');
  const dialect = isPostgres ? 'postgres' : 'mysql';
  
  const options = {
    dialect,
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };

  if (isPostgres) {
    options.dialectOptions = {
      ssl: process.env.DB_SSL === 'false' ? false : {
        require: true,
        rejectUnauthorized: false // Required for Render PostgreSQL connection from external sources
      }
    };
  }

  sequelize = new Sequelize(databaseUrl, options);
} else {
  // Fall back to MySQL configuration using individual variables for local development
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
 * Establishes connection to the database. Checks for database existence and creates it if using MySQL (without URL),
 * then initiates connection authenticate and table sync.
 */
const connectDB = async () => {
  try {
    const isUsingUrl = !!(databaseUrl && databaseUrl.includes('://'));
    const isPostgres = isUsingUrl && (databaseUrl.startsWith('postgres') || databaseUrl.startsWith('postgresql'));

    // 1. Ensure the database exists (MySQL local only - when not using a connection string)
    if (!isUsingUrl) {
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

    // Run automatic seeding for empty database deployments (e.g. Render)
    const autoSeed = require('../utils/autoSeed');
    await autoSeed();
  } catch (error) {
    console.error(`[Database] Database connection failure: ${error.message}`);
    process.exit(1);
  }
};

// Expose sequelize instance as property
connectDB.sequelize = sequelize;

module.exports = connectDB;

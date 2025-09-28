// ====================================================================================
// GrievanceChain Project - Database Configuration (Final, Production Version)
// ====================================================================================
// This file configures the database connection pool. It is now updated to support
// secure SSL/TLS connections, which are required for cloud databases like TiDB Cloud.
// ====================================================================================

const mysql = require('mysql2/promise');
require('dotenv').config();

// Create the connection pool with the configuration from the .env file.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  multipleStatements: true,

  // <<< THE FIX: Enable SSL for secure cloud database connections >>>
  // The `mysql2` library automatically uses TLS when the host ends in .tidbcloud.com
  // but explicitly defining it is best practice for production.
  ssl: {
    // This tells the driver to reject any connection that is not properly secured.
    rejectUnauthorized: true 
  }
});

module.exports = pool;

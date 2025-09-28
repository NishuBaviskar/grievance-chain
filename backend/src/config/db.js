// ====================================================================================
// GrievanceChain Project - Database Configuration (Final, PostgreSQL Version)
// ====================================================================================
// This file configures the database connection pool for PostgreSQL,
// which is used for the simplified Render deployment.
// ====================================================================================

const { Pool } = require('pg'); // Import the pg Pool
require('dotenv').config();

// Create a new connection pool.
// When deployed on Render, it will automatically use the DATABASE_URL environment variable.
// For local development, it will use the credentials from your .env file.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// We export the entire pool. When we need to run a query,
// we will ask the pool for a client.
module.exports = pool;

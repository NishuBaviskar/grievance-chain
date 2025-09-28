// ====================================================================================
// GrievanceChain Project - Database Reset & Seeding Script (Final Version)
// ====================================================================================
// This script performs a hard reset on the database with the final, correct schema
// and populates it with a single starter "super admin" account.
// ====================================================================================

const db = require('./src/config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const schema = `
    -- Drop tables in reverse order of dependency to prevent foreign key errors
    DROP TABLE IF EXISTS complaint_transactions;
    DROP TABLE IF EXISTS complaints;
    DROP TABLE IF EXISTS users;

    -- Create the 'users' table
    CREATE TABLE users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('student', 'admin') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create the 'complaints' table with all final columns
    CREATE TABLE complaints (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id_bc BIGINT UNIQUE,
        user_id_fk INT,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        ipfs_hash VARCHAR(255),
        status ENUM(
            'Not Processed', 
            'Acknowledged',
            'Under Investigation', 
            'Pending Committee Review',
            'Resolved', 
            'Rejected'
        ) DEFAULT 'Not Processed',
        sentiment ENUM('Positive', 'Negative', 'Neutral') DEFAULT 'Neutral',
        created_at_bc BIGINT,
        updated_at_bc BIGINT,
        resolved_by_admin_id_fk INT DEFAULT NULL,
        FOREIGN KEY (user_id_fk) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (resolved_by_admin_id_fk) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Create the 'complaint_transactions' table
    CREATE TABLE complaint_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        complaint_id_fk INT,
        action_type VARCHAR(50) NOT NULL,
        transaction_hash VARCHAR(255) UNIQUE NOT NULL,
        status_to VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (complaint_id_fk) REFERENCES complaints(id) ON DELETE CASCADE
    );
`;

async function seedAdmin() {
    console.log('--- Starting Database Reset & Admin Seeding Script ---');
    let connection;
    try {
        connection = await db.getConnection();
        console.log('✅ Database connection successful.');

        console.log('Resetting database schema with final version...');
        await connection.query(schema);
        console.log('Schema reset successfully.');

        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 12);
        console.log('Default admin password hashed.');

        console.log('Inserting initial super admin...');
        await connection.query(
            `INSERT INTO users (user_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)`, ['A001', 'Super Admin', 'admin@example.com', hashedPassword, 'admin']
        );
        console.log('Super admin "admin@example.com" created.');

        console.log('\n✅✅✅ SUCCESS: Database has been reset and seeded with a single admin account!');

    } catch (error) {
        console.error('❌❌❌ ERROR: An error occurred during the seeding process.');
        console.error(error);
    } finally {
        if (connection) connection.release();
        db.end();
    }
}

seedAdmin();
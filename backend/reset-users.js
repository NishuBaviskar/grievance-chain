// D:\Downloads\Blockchain\grievance-chain\backend\reset-users.js

const db = require('./src/config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// This script will delete and re-create the two default users
// with guaranteed correct password hashes.

async function resetUsers() {
    console.log('--- Starting User Reset Script ---');
    let connection;
    try {
        // Get a connection from the pool
        connection = await db.getConnection();
        console.log('✅ Database connection successful.');

        // 1. Delete existing users to ensure a clean slate
        console.log('Deleting old users (alice@example.com, bob@example.com)...');
        await connection.query("DELETE FROM users WHERE email IN ('alice@example.com', 'bob@example.com')");
        console.log('Old users deleted.');

        // 2. Hash the password
        const password = 'password123';
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Password hashed successfully.');

        // 3. Insert the new student user
        console.log('Inserting new student user...');
        await connection.query(
            'INSERT INTO users (user_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', ['S001', 'Alice Johnson', 'alice@example.com', hashedPassword, 'student']
        );
        console.log('Student "Alice Johnson" created.');

        // 4. Insert the new admin user
        console.log('Inserting new admin user...');
        await connection.query(
            'INSERT INTO users (user_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', ['A001', 'Bob Williams', 'bob@example.com', hashedPassword, 'admin']
        );
        console.log('Admin "Bob Williams" created.');

        console.log('\n✅✅✅ SUCCESS: Users have been reset successfully!');

    } catch (error) {
        console.error('❌❌❌ ERROR: An error occurred during the user reset process.');
        console.error(error);
    } finally {
        // 5. Close the connection
        if (connection) {
            connection.release();
            console.log('Database connection closed.');
        }
        // End the database pool so the script can exit
        db.end();
    }
}

resetUsers();
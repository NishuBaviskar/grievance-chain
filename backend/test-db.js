// D:\Downloads\Blockchain\grievance-chain\backend\test-db.js

const mysql = require('mysql2/promise');
require('dotenv').config();

// This is a standalone script to test ONLY the database connection.

async function testDatabaseConnection() {
    console.log('Attempting to connect to the database...');
    console.log(`  - Host: ${process.env.DB_HOST}`);
    console.log(`  - User: ${process.env.DB_USER}`);
    console.log(`  - Database: ${process.env.DB_NAME}`);

    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT || 3306,
            connectTimeout: 10000 // Wait for 10 seconds before failing
        });

        console.log('✅✅✅ SUCCESS: Database connection was successful!');
    } catch (error) {
        console.error('❌❌❌ FAILURE: Database connection failed.');
        console.error('This is the root cause of the problem. See the error details below:');
        console.error(error);
    } finally {
        if (connection) {
            await connection.end();
            console.log('Connection closed.');
        }
    }
}

testDatabaseConnection();
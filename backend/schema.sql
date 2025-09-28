-- This file defines the complete and final structure of the database.
-- The reset-and-seed.js script executes this first to build the tables.

DROP TABLE IF EXISTS complaint_transactions;
DROP TABLE IF EXISTS complaints;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id_bc BIGINT UNIQUE,
    user_id_fk INT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    ipfs_hash VARCHAR(255),
    status ENUM(
        'Not Processed', 'Acknowledged', 'Under Investigation', 
        'Pending Committee Review', 'Resolved', 'Rejected'
    ) DEFAULT 'Not Processed',
    sentiment ENUM('Positive', 'Negative', 'Neutral') DEFAULT 'Neutral',
    created_at_bc BIGINT,
    updated_at_bc BIGINT,
    resolved_by_admin_id_fk INT DEFAULT NULL,
    FOREIGN KEY (user_id_fk) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (resolved_by_admin_id_fk) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE complaint_transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    complaint_id_fk INT,
    action_type VARCHAR(50) NOT NULL,
    transaction_hash VARCHAR(255) UNIQUE NOT NULL,
    status_to VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (complaint_id_fk) REFERENCES complaints(id) ON DELETE CASCADE
);
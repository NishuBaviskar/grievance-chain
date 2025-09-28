CREATE DATABASE IF NOT EXISTS grievance_chain_db;
USE grievance_chain_db;

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
    complaint_id_bc INT UNIQUE NOT NULL,
    user_id_fk INT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    ipfs_hash VARCHAR(255),
    status ENUM('Not Processed', 'Under Process', 'Resolved', 'Rejected') DEFAULT 'Not Processed',
    created_at_bc BIGINT,
    updated_at_bc BIGINT,
    FOREIGN KEY (user_id_fk) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert dummy data for testing
INSERT INTO users (user_id, name, email, password, role) VALUES
('S001', 'Alice Johnson', 'alice@example.com', '$2a$12$E.o6S.f0f8a.2qJ3qj9Yy.Yf9Qz/8N9dF3e.aB6a.9wI9kF5eC7a', 'student'), -- password: password123
('A001', 'Bob Williams', 'bob@example.com', '$2a$12$E.o6S.f0f8a.2qJ3qj9Yy.Yf9Qz/8N9dF3e.aB6a.9wI9kF5eC7a', 'admin'); -- password: password123
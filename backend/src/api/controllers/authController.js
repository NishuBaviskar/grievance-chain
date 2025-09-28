const db = require('../../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../utils/AppError');

// New registration controller
exports.register = async(req, res, next) => {
    const { userId, name, email, password, role } = req.body;
    if (!userId || !name || !email || !password || !role) {
        return next(new AppError('Please provide all required fields', 400));
    }
    if (role !== 'student' && role !== 'admin') {
        return next(new AppError('Invalid role specified', 400));
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 12);
        const query = 'INSERT INTO users (user_id, name, email, password, role) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(query, [userId, name, email, hashedPassword, role]);

        const newUserQuery = 'SELECT id, user_id, name, email, role FROM users WHERE id = ?';
        const [users] = await db.query(newUserQuery, [result.insertId]);

        res.status(201).json({ status: 'success', message: 'User registered successfully!', data: { user: users[0] } });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return next(new AppError('Email or User ID already exists.', 409));
        }
        next(error);
    }
};

// Login controller remains the same
exports.login = async(req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new AppError('Please provide email and password', 400));
    }
    try {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [users] = await db.query(query, [email]);
        if (users.length === 0 || !(await bcrypt.compare(password, users[0].password))) {
            return next(new AppError('Invalid email or password', 401));
        }
        const user = users[0];
        const token = jwt.sign({ id: user.id, userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
        user.password = undefined;
        res.status(200).json({ status: 'success', token, data: { user } });
    } catch (error) {
        next(error);
    }
};
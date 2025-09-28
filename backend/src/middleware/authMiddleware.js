const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const AppError = require('../utils/AppError');

exports.protect = async(req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return next(new AppError('You are not logged in! Please log in to get access.', 401));
        }
        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
        const query = 'SELECT id, user_id, name, email, role FROM users WHERE id = ?';
        const [users] = await db.query(query, [decoded.id]);
        if (users.length === 0) {
            return next(new AppError('The user belonging to this token does no longer exist.', 401));
        }
        req.user = users[0];
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return next(new AppError('Your session has expired. Please log in again.', 401));
        }
        if (error.name === 'JsonWebTokenError') {
            return next(new AppError('Invalid session. Please log in again.', 401));
        }
        next(error);
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403));
        }
        next();
    };
};
const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.API_PORT || 5001;
const corsOptions = { origin: 'http://localhost:5173', credentials: true, optionsSuccessStatus: 200 };

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const db = require('./src/config/db');
const authRoutes = require('./src/api/routes/authRoutes');
const grievanceRoutes = require('./src/api/routes/grievanceRoutes');
const AppError = require('./src/utils/AppError');
const { startEventListener } = require('./src/services/blockchainService');

app.use('/api/auth', authRoutes);
app.use('/api/grievances', grievanceRoutes);

app.all('*', (req, res, next) => next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404)));

app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    console.error('[GLOBAL ERROR HANDLER]:', err.stack);
    res.status(err.statusCode).json({ status: err.status, message: err.message || 'Something went wrong!' });
});

const startServer = async() => {
    try {
        const connection = await db.getConnection();
        console.log('✅ MySQL Database connected successfully.');
        connection.release();

        server.listen(PORT, () => {
            console.log(`🚀 HTTP Server is running on http://localhost:${PORT}`);
            startEventListener();
        });
    } catch (err) {
        console.error('❌ CRITICAL: Server startup failed.', err.stack);
        process.exit(1);
    }
};

startServer();
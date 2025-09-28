// ====================================================================================
// GrievanceChain Project - Grievance Controller (Final, Stable Version)
// ====================================================================================
// This file contains all business logic for handling grievance-related API requests.
// It includes the final fix for date formatting and admin dashboard stats.
// ====================================================================================

const multer = require('multer');
const axios = require('axios');
const { uploadToIPFS } = require('../../services/ipfsService');
const {
    lodgeComplaintOnChain,
    updateStatusOnChain,
    getComplaintFromChain
} = require('../../services/blockchainService');
const AppError = require('../../utils/AppError');
const db = require('../../config/db');

// --- Multer Setup for handling file uploads in memory ---
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
});
exports.uploadEvidence = upload.single('evidence');

// --- Sentiment Analysis Helper ---
const getSentiment = (text) => {
    const negativeKeywords = ['fail', 'bad', 'unstable', 'delay', 'poor', 'leak', 'problem', 'confusing', 'slow'];
    const positiveKeywords = ['good', 'great', 'resolved', 'helpful', 'excellent', 'support'];
    if (negativeKeywords.some(keyword => text.toLowerCase().includes(keyword))) return 'Negative';
    if (positiveKeywords.some(keyword => text.toLowerCase().includes(keyword))) return 'Positive';
    return 'Neutral';
};

// --- Controller to create a new grievance (Optimistic Update) ---
exports.createGrievance = async(req, res, next) => {
    const { title, category } = req.body;
    const { id: userIdFk, user_id: studentId } = req.user;
    if (!title || !category || !req.file) {
        return next(new AppError('All fields are required.', 400));
    }
    let connection;
    try {
        const ipfsHash = await uploadToIPFS(req.file.buffer);
        const tx = await lodgeComplaintOnChain(studentId, title, ipfsHash);
        connection = await db.getConnection();
        await connection.beginTransaction();
        const sentiment = getSentiment(title);
        const complaintQuery = `INSERT INTO complaints (complaint_id_bc, user_id_fk, title, category, ipfs_hash, status, sentiment, created_at_bc, updated_at_bc) VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const currentTime = Math.floor(Date.now() / 1000);
        const [complaintResult] = await connection.query(complaintQuery, [userIdFk, title, category, ipfsHash, 'Not Processed', sentiment, currentTime, currentTime]);
        const newComplaintDbId = complaintResult.insertId;
        const txQuery = `INSERT INTO complaint_transactions (complaint_id_fk, action_type, transaction_hash, status_to) VALUES (?, ?, ?, ?)`;
        await connection.query(txQuery, [newComplaintDbId, 'CREATE_PENDING', tx.hash, 'Not Processed']);
        await connection.commit();
        const [newComplaintRows] = await connection.query(`SELECT c.*, u.name as student_name, u.user_id as student_id FROM complaints c JOIN users u ON c.user_id_fk = u.id WHERE c.id = ?`, [newComplaintDbId]);
        res.status(201).json({ status: 'success', data: { complaint: newComplaintRows[0] } });
    } catch (error) {
        if (connection) await connection.rollback();
        next(new AppError('Failed to submit grievance.', 500));
    } finally {
        if (connection) connection.release();
    }
};

// --- Controller to fetch a list of all grievances ---
exports.getGrievances = async(req, res, next) => {
    try {
        let query;
        const params = [];
        if (req.user.role === 'admin') {
            query = `SELECT c.*, u.name as student_name, u.user_id as student_id FROM complaints c JOIN users u ON c.user_id_fk = u.id ORDER BY c.id DESC`;
        } else {
            query = `SELECT * FROM complaints WHERE user_id_fk = ? ORDER BY id DESC`;
            params.push(req.user.id);
        }
        const [complaints] = await db.query(query, params);
        res.status(200).json({ status: 'success', results: complaints.length, data: { complaints } });
    } catch (error) {
        next(error);
    }
};

// --- Controller to update grievance status ---
exports.updateGrievanceStatus = async(req, res, next) => {
    const complaintId = parseInt(req.params.id, 10);
    const { status } = req.body;
    const adminId = req.user.id;
    const statusEnum = { "Not Processed": 0, "Acknowledged": 1, "Under Investigation": 2, "Pending Committee Review": 3, "Resolved": 4, "Rejected": 5 };
    if (isNaN(complaintId) || statusEnum[status] === undefined) {
        return next(new AppError('Invalid complaint ID or status provided.', 400));
    }
    try {
        const tx = await updateStatusOnChain(complaintId, statusEnum[status]);
        await tx.wait();
        if (status === 'Resolved' || status === 'Rejected') {
            await db.query('UPDATE complaints SET resolved_by_admin_id_fk = ? WHERE complaint_id_bc = ?', [adminId, complaintId]);
        }
        res.status(200).json({ status: 'success', message: 'Grievance status updated successfully.' });
    } catch (error) {
        next(new AppError('Failed to update status on the blockchain.', 500));
    }
};

// --- Controller for personalized admin stats ---
exports.getAdminDashboardStats = async(req, res, next) => {
    const adminId = req.user.id;
    try {
        const query = `
            SELECT 
                COUNT(*) as totalResolved,
                SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolvedCount,
                SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejectedCount,
                SUM(CASE WHEN sentiment = 'Positive' THEN 1 ELSE 0 END) as positiveSentiment,
                SUM(CASE WHEN sentiment = 'Negative' THEN 1 ELSE 0 END) as negativeSentiment,
                SUM(CASE WHEN sentiment = 'Neutral' THEN 1 ELSE 0 END) as neutralSentiment
            FROM complaints
            WHERE resolved_by_admin_id_fk = ?
        `;
        const [rows] = await db.query(query, [adminId]);
        const stats = rows[0];
        const finalStats = {
            totalResolved: Number(stats.totalResolved || 0),
            resolvedCount: Number(stats.resolvedCount || 0),
            rejectedCount: Number(stats.rejectedCount || 0),
            sentiment: {
                positive: Number(stats.positiveSentiment || 0),
                negative: Number(stats.negativeSentiment || 0),
                neutral: Number(stats.neutralSentiment || 0)
            }
        };
        res.status(200).json({ status: 'success', data: { stats: finalStats } });
    } catch (error) {
        next(new AppError('Failed to fetch admin dashboard stats.', 500));
    }
};

// --- Controller for AI summary ---
exports.getGrievanceSummary = async(req, res, next) => {
    try {
        const [complaints] = await db.query('SELECT title, category, status, sentiment FROM complaints');
        if (complaints.length === 0) {
            return res.status(200).json({ status: 'success', data: { summary: 'No grievance data available yet.' } });
        }
        const getSimulatedSummary = () => {
            const total = complaints.length;
            const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
            const negativeCount = complaints.filter(c => c.sentiment === 'Negative').length;
            let summary = `Analysis of ${total} total grievances indicates a prevailing student sentiment that is largely negative, with ${negativeCount} cases classified as such. The most frequent concerns are academic and infrastructure-related. With ${resolvedCount} cases closed, the resolution process is active, but the high volume of negative sentiment warrants a proactive review.`;
            return summary;
        };
        res.status(200).json({ status: 'success', data: { summary: getSimulatedSummary() } });
    } catch (error) {
        next(new AppError('Failed to generate AI summary.', 500));
    }
};

// --- <<< THE FINAL DATE FORMATTING FIX IS HERE >>> ---
exports.getGrievanceById = async(req, res, next) => {
    const { id } = req.params;
    try {
        const complaint = await getComplaintFromChain(id);
        const statusMap = ["Not Processed", "Acknowledged", "Under Investigation", "Pending Committee Review", "Resolved", "Rejected"];

        // A robust helper function to safely format blockchain timestamps.
        const formatDate = (timestamp) => {
            // Ethers.js can return BigInts. We must convert them to a standard Number.
            const timestampNum = Number(timestamp);
            // Check if the timestamp is valid (not null or zero), which can happen for pending items.
            if (!timestampNum || timestampNum === 0) return 'Pending Confirmation';
            // JavaScript's Date constructor needs milliseconds, while blockchain timestamps are in seconds.
            return new Date(timestampNum * 1000).toLocaleString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        };

        const fullDetails = {
            id: Number(complaint.id),
            studentId: complaint.studentId,
            title: complaint.complaintTitle,
            ipfsHash: complaint.ipfsEvidenceHash,
            status: statusMap[Number(complaint.currentStatus)],
            // Use the safe formatting function for both timestamps.
            createdAt: formatDate(complaint.createdAt),
            lastUpdatedAt: formatDate(complaint.lastUpdatedAt),
        };

        res.status(200).json({ status: 'success', data: { complaint: fullDetails } });
    } catch (error) {
        next(new AppError('Could not retrieve grievance details from the blockchain.', 500));
    }
};

// --- Controller to get transaction history ---
exports.getTransactionsForGrievance = async(req, res, next) => {
    try {
        const { id } = req.params;
        const [complaintRows] = await db.query('SELECT id FROM complaints WHERE complaint_id_bc = ?', [id]);
        if (complaintRows.length === 0) {
            return next(new AppError('Complaint not found in database.', 404));
        }
        const complaintIdFk = complaintRows[0].id;
        const query = 'SELECT * FROM complaint_transactions WHERE complaint_id_fk = ? ORDER BY created_at ASC';
        const [transactions] = await db.query(query, [complaintIdFk]);
        res.status(200).json({ status: 'success', results: transactions.length, data: { transactions } });
    } catch (error) {
        next(error);
    }
};
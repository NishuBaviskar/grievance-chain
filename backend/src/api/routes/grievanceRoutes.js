const express = require('express');
const {
    createGrievance,
    getGrievances,
    uploadEvidence,
    getGrievanceById,
    updateGrievanceStatus,
    getTransactionsForGrievance,
    getGrievanceSummary, // AI summary for all grievances
    getAdminDashboardStats // Personalized stats for one admin
} = require('../controllers/grievanceController');
const { protect, restrictTo } = require('../../middleware/authMiddleware');

const router = express.Router();

// Route for the AI-powered summary of ALL grievances
router.get('/summary', protect, getGrievanceSummary);

// Route for personalized statistics for the logged-in admin
router.get('/admin-stats', protect, restrictTo('admin'), getAdminDashboardStats);

// Main route for getting all grievances or creating a new one
router.route('/')
    .get(protect, getGrievances)
    .post(protect, restrictTo('student'), uploadEvidence, createGrievance);

// Routes for a specific grievance by its blockchain ID
router.route('/:id')
    .get(protect, getGrievanceById);

router.route('/:id/status')
    .patch(protect, restrictTo('admin'), updateGrievanceStatus);

router.route('/:id/transactions')
    .get(protect, getTransactionsForGrievance);

module.exports = router;
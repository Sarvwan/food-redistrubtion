const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');

// Apply auth and ensure role is specifically 'admin'
router.use(auth, role(['admin']));

// @route   GET api/admin/pending-ngos
// @desc    List all NGOs pending approval
// @access  Private (Admin)
router.get('/pending-ngos', adminController.getPendingNGOs);

// @route   PATCH api/admin/approve-ngo/:ngoId
// @desc    Approve an NGO
// @access  Private (Admin)
router.patch('/approve-ngo/:ngoId', adminController.approveNGO);

// @route   PATCH api/admin/reject-ngo/:ngoId
// @desc    Reject an NGO with reason
// @access  Private (Admin)
router.patch('/reject-ngo/:ngoId', adminController.rejectNGO);

// @route   GET api/admin/all-donations
// @desc    View all donations with filters (status, date, city)
// @access  Private (Admin)
router.get('/all-donations', adminController.getAllDonations);

// @route   GET api/admin/stats
// @desc    Get platform stats
// @access  Private (Admin)
router.get('/stats', adminController.getStats);

// @route   GET api/admin/pending-updates
// @desc    Get all pending profile updates
// @access  Private (Admin)
router.get('/pending-updates', adminController.getPendingProfileUpdates);

// @route   POST api/admin/pending-updates/:userId/approve
// @desc    Approve profile update
// @access  Private (Admin)
router.post('/pending-updates/:userId/approve', adminController.approveProfileUpdate);

// @route   POST api/admin/pending-updates/:userId/reject
// @desc    Reject profile update
// @access  Private (Admin)
router.post('/pending-updates/:userId/reject', adminController.rejectProfileUpdate);

module.exports = router;

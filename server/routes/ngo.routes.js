const express = require('express');
const router = express.Router();
const ngoController = require('../controllers/ngo.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const approvedNgo = require('../middleware/approvedNgo.middleware');
const { uploadProof } = require('../middleware/upload.middleware');

// Apply auth and role middleware
router.use(auth, role(['ngo']));

// Apply approved NGO check middleware
router.use(approvedNgo);

// @route   GET api/ngo/available-donations
// @desc    Show all open donations near the NGO (within 15km)
// @access  Private (Approved NGO)
router.get('/available-donations', ngoController.getAvailableDonations);

// @route   GET api/ngo/my-claims
// @desc    Show all donations claimed by the NGO
// @access  Private (Approved NGO)
router.get('/my-claims', ngoController.getMyClaims);

// @route   POST api/ngo/claim/:donationId
// @desc    Claim a donation
// @access  Private (Approved NGO)
router.post('/claim/:donationId', ngoController.claimDonation);

// @route   PATCH api/ngo/collect/:donationId
// @desc    Mark donation as collected
// @access  Private (Approved NGO)
router.patch('/collect/:donationId', ngoController.collectDonation);

// @route   POST api/ngo/proof/:donationId
// @desc    Upload proof photos and complete donation
// @access  Private (Approved NGO)
router.post('/proof/:donationId', uploadProof.array('photos', 5), ngoController.submitProof);

module.exports = router;

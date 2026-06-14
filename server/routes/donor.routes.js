const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const donorController = require('../controllers/donor.controller');
const auth = require('../middleware/auth.middleware');
const role = require('../middleware/role.middleware');
const { uploadFood } = require('../middleware/upload.middleware');

// Apply authentication and role checking middleware to all routes in this file
router.use(auth, role(['donor']));

// @route   POST api/donor/post
// @desc    Create a new donation post
// @access  Private (Donor)
router.post(
  '/post',
  uploadFood.array('photos', 5), // allow up to 5 photos
  [
    check('foodType', 'Food type is required').not().isEmpty(),
    check('quantity', 'Quantity is required').not().isEmpty(),
    check('pickupAddress', 'Pickup address is required').not().isEmpty(),
    check('longitude', 'Longitude is required and must be numeric').isNumeric(),
    check('latitude', 'Latitude is required and must be numeric').isNumeric(),
    check('availableFrom', 'Available From date is required').not().isEmpty(),
    check('availableTill', 'Available Till date is required').not().isEmpty(),
  ],
  donorController.createDonation
);

// @route   GET api/donor/my-donations
// @desc    List all donations by logged-in donor
// @access  Private (Donor)
router.get('/my-donations', donorController.getMyDonations);

// @route   GET api/donor/donation/:id
// @desc    Get full details of a single donation (including proof if exists)
// @access  Private (Donor)
router.get('/donation/:id', donorController.getDonationDetails);

// @route   PATCH api/donor/donation/:id/cancel
// @desc    Cancel an open donation
// @access  Private (Donor)
router.patch('/donation/:id/cancel', donorController.cancelDonation);

module.exports = router;

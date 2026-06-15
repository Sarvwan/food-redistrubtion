const Donation = require('../models/Donation');
const ProofSubmission = require('../models/ProofSubmission');
const geoService = require('../services/geo.service');
const { validationResult } = require('express-validator');

// Create a new donation
exports.createDonation = async (req, res) => {
  // If there are validation errors from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { foodType, quantity, description, pickupAddress, longitude, latitude, occasion, availableFrom, availableTill } = req.body;

  try {
    // req.files is populated by multer upload middleware
    const photoPaths = req.files ? req.files.map(file => `/api/images/${file.filename}`) : [];

    const coordinates = [
      parseFloat(longitude),
      parseFloat(latitude)
    ];

    const newDonation = new Donation({
      donorId: req.user.id,
      foodType,
      quantity,
      description,
      photos: photoPaths,
      pickupAddress,
      location: {
        type: 'Point',
        coordinates
      },
      occasion,
      availableFrom,
      availableTill,
      status: 'open'
    });

    const donation = await newDonation.save();

    // Trigger geo-notification asynchronously
    geoService.notifyNearbyNGOs(donation).catch(err => {
      console.error('Failed to notify nearby NGOs:', err);
    });

    res.status(201).json(donation);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// List all donations by logged-in donor
exports.getMyDonations = async (req, res) => {
  try {
    const donations = await Donation.find({ donorId: req.user.id })
      .sort({ createdAt: -1 });
      
    res.json(donations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get single donation details + proof
exports.getDonationDetails = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate('claimedBy', 'organizationName category');
      
    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }

    // Ensure donor owns this donation
    if (donation.donorId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const proof = await ProofSubmission.findOne({ donationId: donation._id })
      .populate('ngoId', 'organizationName');

    res.json({
      donation,
      proof: proof || null
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Cancel an open donation
exports.cancelDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);

    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }

    // Ensure donor owns this donation
    if (donation.donorId.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    // You can only cancel an open donation
    if (donation.status !== 'open') {
      return res.status(400).json({ msg: `Cannot cancel a donation that is ${donation.status}` });
    }

    donation.status = 'cancelled';
    await donation.save();

    res.json({ msg: 'Donation cancelled successfully', donation });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    res.status(500).send('Server Error');
  }
};

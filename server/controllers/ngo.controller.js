const Donation = require('../models/Donation');
const User = require('../models/User');
const ProofSubmission = require('../models/ProofSubmission');
const emailService = require('../services/email.service');
const path = require('path');

// Get available donations near NGO
exports.getAvailableDonations = async (req, res) => {
  try {
    // The NGO location is stored in the User schema
    const user = await User.findById(req.user.id);
    
    if (!user || !user.location || !user.location.coordinates || user.location.coordinates.length < 2) {
      return res.status(400).json({ msg: 'Your NGO location is not set in your profile' });
    }

    const coordinates = user.location.coordinates;
    const maxDistanceInMeters = 15000; // 15km radius

    // Find open donations using $nearSphere
    const donations = await Donation.find({
      status: 'open',
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: coordinates
          },
          $maxDistance: maxDistanceInMeters
        }
      }
    }).populate('donorId', 'name phone email'); 

    res.json(donations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get NGO's claimed donations
exports.getMyClaims = async (req, res) => {
  try {
    const claims = await Donation.find({ claimedBy: req.ngo._id })
      .sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Claim a donation
exports.claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }

    if (donation.status !== 'open') {
      return res.status(400).json({ msg: `Donation is already ${donation.status}` });
    }

    donation.status = 'claimed';
    donation.claimedBy = req.ngo._id;
    await donation.save();

    // Notify Donor via email
    const donor = await User.findById(donation.donorId);
    if (donor && donor.email) {
      const ngoUser = await User.findById(req.ngo.userId);
      const emailSubject = `Your Donation has been claimed!`;
      const emailHtml = `
        <h3>Good news! Your donation has been claimed.</h3>
        <p><strong>NGO Name:</strong> ${req.ngo.organizationName}</p>
        <p><strong>Category:</strong> ${req.ngo.category}</p>
        <p><strong>Contact Name:</strong> ${ngoUser.name}</p>
        <p><strong>Phone:</strong> ${ngoUser.phone || 'Not provided'}</p>
        <p>They will contact you soon for pickup at: ${donation.pickupAddress}</p>
      `;
      await emailService.sendEmail(donor.email, emailSubject, emailHtml);
    }

    res.json({ msg: 'Donation claimed successfully', donation });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Collect a donation
exports.collectDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }

    // Ensure this NGO is the one that claimed it
    if (donation.claimedBy.toString() !== req.ngo._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized to collect this donation' });
    }

    if (donation.status !== 'claimed') {
      return res.status(400).json({ msg: `Cannot collect donation. Current status: ${donation.status}` });
    }

    donation.status = 'collected';
    await donation.save();

    res.json({ msg: 'Donation collected. Please upload proof photos next.', donation });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Submit Proof
exports.submitProof = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.donationId);

    if (!donation) {
      return res.status(404).json({ msg: 'Donation not found' });
    }

    if (donation.claimedBy.toString() !== req.ngo._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized for this donation' });
    }

    if (donation.status !== 'collected') {
      return res.status(400).json({ msg: 'Donation must be collected before submitting proof' });
    }

    if (!req.files || req.files.length < 2 || req.files.length > 5) {
      return res.status(400).json({ msg: 'Please upload between 2 and 5 photos as proof' });
    }

    const photoPaths = req.files.map(file => `/uploads/proof-photos/${file.filename}`);

    const proof = new ProofSubmission({
      donationId: donation._id,
      ngoId: req.ngo._id,
      photos: photoPaths,
      sentToDonor: true
    });

    await proof.save();

    // Complete the donation
    donation.status = 'completed';
    await donation.save();
    
    // Increment NGO's served count (assuming +1 per donation batch)
    req.ngo.servedCount += 1;
    await req.ngo.save();

    // Email donor with proof
    const donor = await User.findById(donation.donorId);
    if (donor && donor.email) {
      const emailSubject = `Thank you! Your donation was distributed successfully`;
      const emailHtmlBody = `
        <h3>Your donation made a difference!</h3>
        <p>${req.ngo.organizationName} has successfully distributed your donation (${donation.foodType}).</p>
        <p>Please find the proof photos linked below:</p>
      `;

      // Use the server's base URL to link to the static files
      // If deployed, CLIENT_URL or SERVER_URL should be in .env
      const baseUrl = process.env.CLIENT_URL || 'http://localhost:5000';
      const photoLinksHtml = photoPaths.map(p => `<p><img src="${baseUrl}${p}" alt="Proof Image" style="max-width: 400px; display: block; margin-top: 10px;"/></p>`).join('');

      const fullHtml = emailHtmlBody + photoLinksHtml + `<p>Thank you for using Food Relief Platform!</p>`;

      await emailService.sendEmail(donor.email, emailSubject, fullHtml);
    }

    res.json({ msg: 'Proof submitted successfully. Donation completed.', proof, donation });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Donation not found' });
    }
    res.status(500).send('Server Error');
  }
};

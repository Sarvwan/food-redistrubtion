const NGO = require('../models/NGO');
const User = require('../models/User');
const Donation = require('../models/Donation');
const emailService = require('../services/email.service');

// List pending NGOs
exports.getPendingNGOs = async (req, res) => {
  try {
    const pendingNGOs = await NGO.find({ approvalStatus: 'pending' })
      .populate('userId', 'name email phone address createdAt');
    
    res.json(pendingNGOs);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Approve an NGO
exports.approveNGO = async (req, res) => {
  try {
    const ngo = await NGO.findById(req.params.ngoId).populate('userId', 'email name');
    
    if (!ngo) {
      return res.status(404).json({ msg: 'NGO not found' });
    }
    
    if (ngo.approvalStatus === 'approved') {
      return res.status(400).json({ msg: 'NGO is already approved' });
    }

    ngo.approvalStatus = 'approved';
    await ngo.save();

    // Send Welcome Email
    if (ngo.userId && ngo.userId.email) {
      const subject = 'Your NGO Account has been Approved!';
      const html = `
        <h3>Congratulations, ${ngo.userId.name}!</h3>
        <p>Your NGO, <strong>${ngo.organizationName}</strong>, has been approved on the Food Relief Platform.</p>
        <p>You can now log in and start claiming available food donations near you.</p>
        <p>Thank you for partnering with us to reduce food waste!</p>
      `;
      await emailService.sendEmail(ngo.userId.email, subject, html);
    }

    res.json({ msg: 'NGO approved successfully', ngo });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'NGO not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Reject an NGO
exports.rejectNGO = async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason) {
      return res.status(400).json({ msg: 'Rejection reason is required' });
    }

    const ngo = await NGO.findById(req.params.ngoId).populate('userId', 'email name');
    
    if (!ngo) {
      return res.status(404).json({ msg: 'NGO not found' });
    }

    if (ngo.approvalStatus === 'rejected') {
      return res.status(400).json({ msg: 'NGO is already rejected' });
    }

    ngo.approvalStatus = 'rejected';
    await ngo.save();

    // Send Rejection Email
    if (ngo.userId && ngo.userId.email) {
      const subject = 'Update on your Food Relief Platform Application';
      const html = `
        <h3>Hello ${ngo.userId.name},</h3>
        <p>We have reviewed your application for <strong>${ngo.organizationName}</strong>.</p>
        <p>Unfortunately, we are unable to approve your account at this time.</p>
        <p><strong>Reason provided by administrator:</strong><br/>${reason}</p>
        <p>Please contact support if you believe this is an error or if you have any questions.</p>
      `;
      await emailService.sendEmail(ngo.userId.email, subject, html);
    }

    res.json({ msg: 'NGO rejected successfully', ngo });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'NGO not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Get all donations with filtering
exports.getAllDonations = async (req, res) => {
  try {
    const { status, startDate, endDate, city } = req.query;
    let filter = {};

    // Filter by status
    if (status) {
      filter.status = status;
    }

    // Filter by date range
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Filter by city (using simple regex match on pickupAddress)
    if (city) {
      filter.pickupAddress = { $regex: city, $options: 'i' };
    }

    const donations = await Donation.find(filter)
      .populate('donorId', 'name email phone')
      .populate('claimedBy', 'organizationName category')
      .sort({ createdAt: -1 });

    res.json(donations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get platform stats
exports.getStats = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const completedDonations = await Donation.countDocuments({ status: 'completed' });
    const approvedNGOs = await NGO.countDocuments({ approvalStatus: 'approved' });

    const completedList = await Donation.find({ status: 'completed' }).select('quantity');
    
    let totalFoodDistributedUnits = 0;
    
    completedList.forEach(d => {
      if (d.quantity) {
        const qtyStr = String(d.quantity);
        const match = qtyStr.match(/\d+/);
        if (match) {
          totalFoodDistributedUnits += parseInt(match[0], 10);
        }
      }
    });

    res.json({
      totalDonations,
      completedDonations,
      approvedNGOs,
      totalFoodDistributedApprox: totalFoodDistributedUnits
    });
  } catch (err) {
    console.error("Admin Stats Error:", err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

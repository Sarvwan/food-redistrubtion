const NGO = require('../models/NGO');

module.exports = async function (req, res, next) {
  try {
    // req.user is set by the auth.middleware.js
    const ngo = await NGO.findOne({ userId: req.user.id });
    
    if (!ngo) {
      return res.status(404).json({ msg: 'NGO profile not found' });
    }

    if (ngo.approvalStatus !== 'approved') {
      return res.status(403).json({ msg: 'Access denied: NGO account is pending approval or rejected' });
    }

    // Attach the NGO document to the request for easy access in controllers
    req.ngo = ngo;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

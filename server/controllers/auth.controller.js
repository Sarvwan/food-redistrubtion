const User = require('../models/User');
const NGO = require('../models/NGO');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Register User
exports.register = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, email, password, role, phone, address, organizationName, registrationNumber, category, longitude, latitude, lng, lat } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
    }

    // Role-specific validation
    if (role === 'ngo') {
      if (!organizationName || !registrationNumber || !category) {
        return res.status(400).json({ 
          errors: [{ msg: 'NGOs must provide organizationName, registrationNumber, and category' }] 
        });
      }
    }

    user = new User({
      name,
      email,
      password,
      role,
      phone,
      address
    });

    const finalLng = parseFloat(longitude || lng || 0);
    const finalLat = parseFloat(latitude || lat || 0);
    user.location = {
      type: 'Point',
      coordinates: [isNaN(finalLng) ? 0 : finalLng, isNaN(finalLat) ? 0 : finalLat]
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();

    // If role is ngo, create NGO record
    if (role === 'ngo') {
      const ngo = new NGO({
        userId: user._id,
        organizationName,
        registrationNumber,
        category,
        approvalStatus: 'pending' // default from schema
      });
      await ngo.save();
    }

    // Return JWT
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' }, // Expires in 7 days
      (err, token) => {
        if (err) throw err;
        res.status(201).json({ token, user: { id: user._id, role: user.role } });
      }
    );

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Login User
exports.login = async (req, res) => {
  // Validate input
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
    }

    // Return JWT
    const payload = {
      user: {
        id: user._id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({ token, user: { id: user._id, role: user.role } });
      }
    );

  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address, organizationName, registrationNumber, category, password } = req.body;
    
    // Find user
    let user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    let passwordChanged = false;
    // Handle immediate password change
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      passwordChanged = true;
    }

    if (user.role === 'admin') {
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (address) user.address = address;
      await user.save();
      return res.status(200).json({ message: passwordChanged ? 'Password and profile updated successfully' : 'Profile updated successfully', user: { id: user._id, role: user.role, name: user.name } });
    }

    // For Donors and NGOs, store other fields in pendingProfileUpdates
    const updates = {};
    if (name && name !== user.name) updates.name = name;
    if (phone && phone !== user.phone) updates.phone = phone;
    if (address && address !== user.address) updates.address = address;
    
    if (user.role === 'ngo') {
      let ngo = await NGO.findOne({ userId: user._id });
      if (ngo) {
        if (organizationName && organizationName !== ngo.organizationName) updates.organizationName = organizationName;
        if (registrationNumber && registrationNumber !== ngo.registrationNumber) updates.registrationNumber = registrationNumber;
        if (category && category !== ngo.category) updates.category = category;
      }
    }

    let isPending = false;
    if (Object.keys(updates).length > 0) {
      user.pendingProfileUpdates = updates;
      isPending = true;
    }

    await user.save();

    let msg = 'Profile updated successfully';
    if (isPending && passwordChanged) msg = 'Password changed successfully. Other profile updates are pending admin approval.';
    else if (isPending) msg = 'Profile updates are pending admin approval.';
    else if (passwordChanged) msg = 'Password changed successfully.';

    res.status(200).json({ 
       message: msg, 
       user: { id: user._id, role: user.role, name: user.name },
       pendingUpdates: user.pendingProfileUpdates 
    });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};


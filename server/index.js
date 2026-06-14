require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const connectDB = require('./config/db');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));
// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/donor', require('./routes/donor.routes'));
app.use('/api/ngo', require('./routes/ngo.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
// app.use('/api/notifications', require('./routes/notification.routes'));
// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is healthy',
    uptime: process.uptime(),
    timestamp: new Date()
  });
});

// Public stats endpoint for landing page
app.get('/api/stats', async (req, res) => {
  try {
    const Donation = require('./models/Donation');
    const NGO = require('./models/NGO');
    
    const totalDonations = await Donation.countDocuments();
    const completedDonations = await Donation.countDocuments({ status: 'completed' });
    const approvedNGOs = await NGO.countDocuments({ approvalStatus: 'approved' });
    
    const completedList = await Donation.find({ status: 'completed' }).select('quantity');
    let totalFoodDistributedUnits = 0;
    completedList.forEach(d => {
      const match = d.quantity.match(/\d+/);
      if (match) {
        totalFoodDistributedUnits += parseInt(match[0], 10);
      }
    });

    res.json({
      totalDonations,
      completedDonations,
      approvedNGOs,
      totalFoodDistributedApprox: totalFoodDistributedUnits
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Catch-all route removed due to Express 5 wildcard syntax error.
// Static file serving handles the main index.html for known paths.


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./server/models/User');

const seed = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/food_relief');
    console.log('Connected to DB');

    // Create Admin
    let admin = await User.findOne({ email: 'admin@sarvwan.org' });
    if (!admin) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@sarvwan.org',
        password: hashedPassword,
        phone: '1234567890',
        role: 'admin',
        isApproved: true
      });
      console.log('Admin created');
    }

    // Create Donor
    let donor = await User.findOne({ email: 'donor@example.com' });
    if (!donor) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('donor123', salt);
      donor = await User.create({
        name: 'City Supermarket',
        email: 'donor@example.com',
        password: hashedPassword,
        phone: '9876543210',
        role: 'donor',
        category: 'supermarket',
        address: '123 Food Street',
        location: {
          type: 'Point',
          coordinates: [78.4867, 17.3850] // Default coords (Hyderabad)
        },
        isApproved: true
      });
      console.log('Donor created');
    }

    // Create NGO
    let ngo = await User.findOne({ email: 'ngo@example.com' });
    if (!ngo) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('ngo123', salt);
      ngo = await User.create({
        name: 'Helping Hands',
        email: 'ngo@example.com',
        password: hashedPassword,
        phone: '5555555555',
        role: 'ngo',
        organizationName: 'Helping Hands Foundation',
        registrationNumber: 'REG12345',
        isApproved: true, // Approve it automatically for testing
        location: {
          type: 'Point',
          coordinates: [78.4867, 17.3850]
        }
      });
      console.log('NGO created');
    }

    console.log('Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

seed();

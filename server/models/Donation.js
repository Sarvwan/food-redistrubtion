const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  foodType: { type: String, required: true },
  quantity: { type: String, required: true },
  description: { type: String },
  photos: [{ type: String }],
  pickupAddress: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number] } // [longitude, latitude]
  },
  occasion: { type: String },
  availableFrom: { type: Date, required: true },
  availableTill: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['open', 'claimed', 'collected', 'completed', 'expired', 'cancelled'], 
    default: 'open' 
  },
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO' },
  createdAt: { type: Date, default: Date.now }
});

donationSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Donation', donationSchema);

const mongoose = require('mongoose');

const ngoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organizationName: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['orphanage', 'old_age_home', 'school', 'general_ngo'], 
    required: true 
  },
  documents: { type: String },
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  servedCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('NGO', ngoSchema);

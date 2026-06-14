const mongoose = require('mongoose');

const proofSubmissionSchema = new mongoose.Schema({
  donationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true },
  ngoId: { type: mongoose.Schema.Types.ObjectId, ref: 'NGO', required: true },
  photos: [{ type: String, required: true }],
  submittedAt: { type: Date, default: Date.now },
  sentToDonor: { type: Boolean, default: false }
});

module.exports = mongoose.model('ProofSubmission', proofSubmissionSchema);

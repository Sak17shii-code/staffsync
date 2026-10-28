const mongoose = require('mongoose');
module.exports = mongoose.model('Leave', new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['casual', 'sick', 'annual', 'unpaid'], default: 'casual' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  comment: { type: String, default: '' }
}, { timestamps: true }));

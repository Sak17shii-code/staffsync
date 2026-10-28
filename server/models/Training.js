const mongoose = require('mongoose');
module.exports = mongoose.model('Training', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  trainer: { type: String, default: '' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }));

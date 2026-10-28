const mongoose = require('mongoose');
const s = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  checkIn: Date,
  checkOut: Date,
  status: { type: String, enum: ['present', 'half-day'], default: 'present' }
}, { timestamps: true });
s.index({ employee: 1, date: 1 }, { unique: true });
module.exports = mongoose.model('Attendance', s);

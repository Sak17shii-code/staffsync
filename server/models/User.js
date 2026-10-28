const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['hr', 'manager', 'employee'], default: 'employee' },
  department: { type: String, default: '' },
  position: { type: String, default: '' },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  salary: { type: Number, default: 0 },
  joinDate: { type: Date, default: Date.now },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  active: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});
userSchema.methods.matchPassword = function (p) { return bcrypt.compare(p, this.password); };
userSchema.set('toJSON', { transform: (_d, r) => { delete r.password; return r; } });

module.exports = mongoose.model('User', userSchema);

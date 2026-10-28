const router = require('express').Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);
const today = () => new Date().toISOString().slice(0, 10);

router.post('/checkin', async (req, res, next) => {
  try {
    if (await Attendance.findOne({ employee: req.user._id, date: today() }))
      return res.status(400).json({ message: 'Already checked in today' });
    res.status(201).json(await Attendance.create({ employee: req.user._id, date: today(), checkIn: new Date() }));
  } catch (e) { next(e); }
});

router.post('/checkout', async (req, res, next) => {
  try {
    const rec = await Attendance.findOne({ employee: req.user._id, date: today() });
    if (!rec) return res.status(400).json({ message: 'Check in first' });
    if (rec.checkOut) return res.status(400).json({ message: 'Already checked out' });
    rec.checkOut = new Date();
    rec.status = (rec.checkOut - rec.checkIn) / 36e5 < 4 ? 'half-day' : 'present';
    await rec.save();
    res.json(rec);
  } catch (e) { next(e); }
});

router.get('/mine', async (req, res, next) => {
  try { res.json(await Attendance.find({ employee: req.user._id }).sort('-date').limit(60)); }
  catch (e) { next(e); }
});

router.get('/', allow('hr', 'manager'), async (req, res, next) => {
  try {
    let q = {};
    if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');
      q = { employee: { $in: team.map((t) => t._id) } };
    }
    if (req.query.date) q.date = req.query.date;
    res.json(await Attendance.find(q).populate('employee', 'name department').sort('-date').limit(200));
  } catch (e) { next(e); }
});

module.exports = router;

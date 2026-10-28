const router = require('express').Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.post('/', async (req, res, next) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    if (!startDate || !endDate || new Date(endDate) < new Date(startDate))
      return res.status(400).json({ message: 'Invalid dates' });
    res.status(201).json(await Leave.create({ employee: req.user._id, type, startDate, endDate, reason }));
  } catch (e) { next(e); }
});

router.get('/mine', async (req, res, next) => {
  try { res.json(await Leave.find({ employee: req.user._id }).sort('-createdAt')); }
  catch (e) { next(e); }
});

// HR: all. Manager: team only.
router.get('/', allow('hr', 'manager'), async (req, res, next) => {
  try {
    let q = {};
    if (req.user.role === 'manager') {
      const team = await User.find({ manager: req.user._id }).select('_id');
      q = { employee: { $in: team.map((t) => t._id) } };
    }
    res.json(await Leave.find(q).populate('employee', 'name department').sort('-createdAt'));
  } catch (e) { next(e); }
});

router.put('/:id/status', allow('hr', 'manager'), async (req, res, next) => {
  try {
    const { status, comment } = req.body;
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ message: 'Bad status' });
    const leave = await Leave.findById(req.params.id).populate('employee');
    if (!leave) return res.status(404).json({ message: 'Not found' });
    if (String(leave.employee._id) === String(req.user._id))
      return res.status(403).json({ message: 'Cannot review own leave' });
    if (req.user.role === 'manager' && String(leave.employee.manager) !== String(req.user._id))
      return res.status(403).json({ message: 'Not your team member' });
    leave.status = status;
    leave.comment = comment || '';
    leave.reviewedBy = req.user._id;
    await leave.save();
    res.json(leave);
  } catch (e) { next(e); }
});

module.exports = router;

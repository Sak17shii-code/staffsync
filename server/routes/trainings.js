const router = require('express').Router();
const Training = require('../models/Training');
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    let q = {};
    if (req.user.role === 'manager') q = { createdBy: req.user._id };
    if (req.user.role === 'employee') q = { participants: req.user._id };
    res.json(await Training.find(q).populate('participants', 'name').populate('createdBy', 'name').sort('-startDate'));
  } catch (e) { next(e); }
});

router.post('/', allow('hr', 'manager'), async (req, res, next) => {
  try {
    const { title, description, trainer, startDate, endDate } = req.body;
    let participants = req.body.participants || [];
    if (req.user.role === 'manager') {
      const team = (await User.find({ manager: req.user._id }).select('_id')).map((t) => String(t._id));
      participants = participants.filter((p) => team.includes(String(p)));
    }
    if (!title || !startDate || !endDate) return res.status(400).json({ message: 'Missing fields' });
    res.status(201).json(await Training.create({
      title, description, trainer, startDate, endDate, participants, createdBy: req.user._id
    }));
  } catch (e) { next(e); }
});

router.delete('/:id', allow('hr', 'manager'), async (req, res, next) => {
  try {
    const t = await Training.findById(req.params.id);
    if (!t) return res.status(404).json({ message: 'Not found' });
    if (req.user.role === 'manager' && String(t.createdBy) !== String(req.user._id))
      return res.status(403).json({ message: 'Not yours' });
    await t.deleteOne();
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

module.exports = router;

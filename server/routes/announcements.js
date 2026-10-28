const router = require('express').Router();
const Announcement = require('../models/Announcement');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

router.get('/', async (_req, res, next) => {
  try { res.json(await Announcement.find().populate('postedBy', 'name').sort('-createdAt')); }
  catch (e) { next(e); }
});

router.post('/', allow('hr'), async (req, res, next) => {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) return res.status(400).json({ message: 'Title and message required' });
    res.status(201).json(await Announcement.create({ title, message, type, postedBy: req.user._id }));
  } catch (e) { next(e); }
});

router.delete('/:id', allow('hr'), async (req, res, next) => {
  try { await Announcement.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' }); }
  catch (e) { next(e); }
});

module.exports = router;

const router = require('express').Router();
const User = require('../models/User');
const { protect, allow } = require('../middleware/auth');

router.use(protect);

// HR: all. Manager: own team.
router.get('/', allow('hr', 'manager'), async (req, res, next) => {
  try {
    const q = req.user.role === 'manager' ? { manager: req.user._id } : {};
    res.json(await User.find(q).populate('manager', 'name').sort('name'));
  } catch (e) { next(e); }
});

// Self profile update (limited fields)
router.put('/me/profile', async (req, res, next) => {
  try {
    const { name, phone, address, password } = req.body;
    const u = req.user;
    if (name) u.name = name;
    if (phone !== undefined) u.phone = phone;
    if (address !== undefined) u.address = address;
    if (password) u.password = password;
    await u.save();
    res.json(u);
  } catch (e) { next(e); }
});

router.post('/', allow('hr'), async (req, res, next) => {
  try {
    if (await User.findOne({ email: (req.body.email || '').toLowerCase() }))
      return res.status(400).json({ message: 'Email already used' });
    if (!req.body.manager) delete req.body.manager;
    res.status(201).json(await User.create(req.body));
  } catch (e) { next(e); }
});

router.put('/:id', allow('hr'), async (req, res, next) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: 'Not found' });
    const body = { ...req.body };
    if (!body.password) delete body.password;
    if (!body.manager) body.manager = null;
    Object.assign(u, body);
    await u.save();
    res.json(u);
  } catch (e) { next(e); }
});

router.delete('/:id', allow('hr'), async (req, res, next) => {
  try {
    if (req.params.id === String(req.user._id)) return res.status(400).json({ message: 'Cannot delete self' });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
});

module.exports = router;

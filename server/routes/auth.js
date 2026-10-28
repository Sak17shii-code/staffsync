const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Announcement = require('../models/Announcement');
const { protect } = require('../middleware/auth');

const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const autoSeedIfEmpty = async () => {
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('Database is empty. Auto-seeding initial demo accounts...');
    const hr = await User.create({
      name: 'Hannah HR',
      email: 'hr@staffsync.com',
      password: 'hr1234',
      role: 'hr',
      department: 'Human Resources',
      position: 'HR Lead'
    });
    const mgr = await User.create({
      name: 'Mike Manager',
      email: 'manager@staffsync.com',
      password: 'mgr1234',
      role: 'manager',
      department: 'Engineering',
      position: 'Engineering Manager'
    });
    await User.create({
      name: 'Eva Employee',
      email: 'employee@staffsync.com',
      password: 'emp1234',
      role: 'employee',
      department: 'Engineering',
      position: 'Developer',
      manager: mgr._id
    });
    await Announcement.create({
      title: 'Welcome to StaffSync',
      message: 'Mark attendance daily and apply leaves from the Leaves page.',
      postedBy: hr._id
    });
    console.log('Auto-seed completed successfully.');
  }
};

// Route to manually trigger seed if ever needed
router.post('/seed', async (_req, res, next) => {
  try {
    await autoSeedIfEmpty();
    res.json({ ok: true, message: 'Database seeded with demo users.' });
  } catch (e) {
    next(e);
  }
});

// Public signup always creates an employee. HR/manager accounts made by HR or seed.
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields required' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'Email already used' });
    const user = await User.create({ name, email, password, role: 'employee' });
    res.status(201).json({ token: sign(user), user });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    await autoSeedIfEmpty();
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
    if (!user || !user.active || !(await user.matchPassword(req.body.password || '')))
      return res.status(401).json({ message: 'Wrong email or password' });
    res.json({ token: sign(user), user });
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json(req.user));

module.exports = router;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Seeding helper function
const seedDatabase = async () => {
  const User = require('./models/User');
  const Announcement = require('./models/Announcement');
  const Training = require('./models/Training');

  await Promise.all([
    User.deleteMany({}),
    Announcement.deleteMany({}),
    Training.deleteMany({})
  ]);

  const hr = await User.create({
    name: 'Hannah Hayes',
    email: 'hr@staffsync.com',
    password: 'hr1234',
    role: 'hr',
    department: 'Human Resources',
    position: 'Chief People Officer',
    phone: '+1 (555) 101-2001',
    salary: 9500
  });

  const mgr = await User.create({
    name: 'Michael Chang',
    email: 'manager@staffsync.com',
    password: 'mgr1234',
    role: 'manager',
    department: 'Engineering',
    position: 'VP of Engineering',
    phone: '+1 (555) 101-2002',
    salary: 8200
  });

  const emp = await User.create({
    name: 'Eva Rodriguez',
    email: 'employee@staffsync.com',
    password: 'emp1234',
    role: 'employee',
    department: 'Engineering',
    position: 'Senior Fullstack Engineer',
    phone: '+1 (555) 101-2003',
    salary: 6800,
    manager: mgr._id
  });

  const emp2 = await User.create({
    name: 'David Patel',
    email: 'david@staffsync.com',
    password: 'emp1234',
    role: 'employee',
    department: 'Product & Design',
    position: 'Lead UX Architect',
    phone: '+1 (555) 101-2004',
    salary: 6500,
    manager: mgr._id
  });

  await Announcement.create({
    title: 'Welcome to StaffSync — HR Management Solution',
    message: 'Welcome to the centralized StaffSync workforce portal. Please punch in daily, review your leave allocations, and connect with your team manager.',
    type: 'announcement',
    postedBy: hr._id
  });

  await Announcement.create({
    title: 'Q4 All-Hands Town Hall & Employee Awards',
    message: 'Join us next Friday at 3:00 PM for our quarterly retrospective, product roadmap preview, and peer recognition awards presentation.',
    type: 'news',
    postedBy: hr._id
  });

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const twoWeeks = new Date();
  twoWeeks.setDate(twoWeeks.getDate() + 14);

  await Training.create({
    title: 'Fullstack Cloud & Microservices Architecture',
    description: 'Comprehensive deep dive into scalable distributed systems, Docker containers, and event-driven architectures.',
    trainer: 'Dr. Aris Thorne',
    startDate: nextWeek,
    endDate: twoWeeks,
    participants: [emp._id, emp2._id],
    createdBy: mgr._id
  });

  return { message: 'Database successfully seeded with demo users!' };
};

// Diagnostic status route
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    system: 'StaffSync HR Enterprise',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Database connection middleware for data routes
app.use(async (req, res, next) => {
  if (req.path === '/api/health') return next();

  try {
    await connectDB();

    // Auto-seed on first run if database has 0 users
    if (mongoose.connection.readyState === 1) {
      const User = require('./models/User');
      const count = await User.countDocuments();
      if (count === 0) {
        console.log('Detected empty database on launch. Auto-seeding demo records...');
        await seedDatabase();
        console.log('Auto-seeding complete.');
      }
    }

    next();
  } catch (err) {
    console.error('Database connection error in request:', err.message);
    res.status(503).json({
      message: `Database connection unavailable: ${err.message}. Please configure your MONGO_URI in environment variables.`
    });
  }
});

// Manual 1-click cloud seed endpoint
app.get('/api/seed', async (_req, res) => {
  try {
    const result = await seedDatabase();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const registerRoutes = (router) => {
  router.use('/auth', require('./routes/auth'));
  router.use('/users', require('./routes/users'));
  router.use('/leaves', require('./routes/leaves'));
  router.use('/attendance', require('./routes/attendance'));
  router.use('/announcements', require('./routes/announcements'));
  router.use('/trainings', require('./routes/trainings'));
};

const apiRouter = express.Router();
registerRoutes(apiRouter);

// Support both /api/... and direct mounts
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
  connectDB()
    .then(() => app.listen(PORT, () => console.log(`🚀 StaffSync API server running on port :${PORT}`)))
    .catch((err) => console.error('Initial DB connection error:', err.message));
}

module.exports = app;

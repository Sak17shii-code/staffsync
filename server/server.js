require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// Diagnostic status route (works even if DB is still connecting)
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
  // Skip DB check for health route
  if (req.path === '/api/health') return next();

  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error in request:', err.message);
    res.status(503).json({
      message: `Database connection unavailable: ${err.message}. Please configure your MONGO_URI in environment variables.`
    });
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

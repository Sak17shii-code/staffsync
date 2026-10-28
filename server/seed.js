require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Announcement = require('./models/Announcement');
const Training = require('./models/Training');

(async () => {
  if (!process.env.MONGO_URI) {
    console.error('ERROR: MONGO_URI environment variable is not defined in .env');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    console.log('Purging existing records...');
    await Promise.all([
      User.deleteMany({}),
      Announcement.deleteMany({}),
      Training.deleteMany({})
    ]);

    console.log('Creating standard demo roles...');
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

    console.log('Seeding company circulars and bulletins...');
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

    console.log('Seeding professional development training programs...');
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

    console.log('\n======================================================');
    console.log('✅ STAFFSYNC DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Demo Credentials for Instant Review:');
    console.log('  1. HR Administrator : hr@staffsync.com      | Password: hr1234');
    console.log('  2. Team Manager     : manager@staffsync.com | Password: mgr1234');
    console.log('  3. Staff Employee   : employee@staffsync.com| Password: emp1234');
    console.log('======================================================\n');

    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
})();

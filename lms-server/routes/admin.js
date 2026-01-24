const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const testController = require('../controllers/teacherController');
const Timetable = require('../models/Timetable');
const Course = require('../models/Course');
const User = require('../models/User');

// Teacher management
router.post('/create-teacher', adminController.createTeacher);
router.get('/teachers', adminController.listTeachers);
// Student management
router.get('/students', adminController.listStudents);
// Assign courses/timetables
router.post('/assign-course', adminController.assignCourse);
router.post('/assign-timetable', adminController.assignTimetable);
// Upload resources
router.post('/upload-resource', adminController.uploadResource);
// Monitor data
router.get('/monitor', adminController.monitor);
// Course management
router.post('/courses', adminController.createCourse);
router.get('/courses', adminController.listCourses);
// User CRUD
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
// Admin: View all test results
router.get('/results', testController.getAllResults);
router.get('/timetables', async (req, res) => {
  try {
    const timetables = await Timetable.find().populate('course', 'title').populate('teacher', 'name');
    res.json({ timetables });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Test endpoint to check current state
router.get('/test', async (req, res) => {
  try {
    const courseCount = await Course.countDocuments();
    const timetableCount = await Timetable.countDocuments();
    const userCount = await User.countDocuments();
    const sampleCourses = await Course.find().limit(3).populate('teacher', 'name');
    const sampleTimetables = await Timetable.find().limit(3).populate('course', 'title');
    
    res.json({
      counts: { courseCount, timetableCount, userCount },
      sampleCourses,
      sampleTimetables
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Test endpoint to create sample data
router.post('/test-create', async (req, res) => {
  try {
    // Find a teacher
    const teacher = await User.findOne({ role: 'teacher' });
    if (!teacher) {
      return res.status(400).json({ message: 'No teacher found. Please create a teacher first.' });
    }
    
    // Find a student
    const student = await User.findOne({ role: 'student' });
    if (!student) {
      return res.status(400).json({ message: 'No student found. Please create a student first.' });
    }
    
    // Create a test course
    const course = await Course.create({
      title: 'Test Course ' + Date.now(),
      description: 'This is a test course',
      teacher: teacher._id,
      students: [student._id] // Enroll the student
    });
    
    // Create a test timetable
    const timetable = await Timetable.create({
      course: course._id,
      teacher: teacher._id,
      students: [student._id], // Include the student
      schedule: [{ day: 'Monday', startTime: '09:00', endTime: '10:00', notes: 'Test class' }]
    });
    
    // Link timetable to course
    course.timetable = timetable._id;
    await course.save();
    
    res.json({ 
      message: 'Test data created successfully',
      course: await course.populate(['teacher', 'students'], 'name'),
      timetable: await timetable.populate(['course', 'teacher', 'students'], 'name')
    });
  } catch (err) {
    console.error('Test create error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Create first admin (public route for initial setup)
router.post('/create-first-admin', adminController.createFirstAdmin);

module.exports = router; 
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../utils/email');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const Message = require('../models/Message');

function generateRegistrationNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const registrationNumber = generateRegistrationNumber();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      registrationNumber,
      role: 'student',
      emailVerified: true // For demo, skip verification
    });
    // Send welcome email
    await sendEmail(email, 'Welcome to LMS', `Your registration number is: ${registrationNumber}`);
    res.status(201).json({ message: 'Registration successful', registrationNumber });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { regNumber, password } = req.body;
    if (!regNumber || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ registrationNumber: regNumber, role: 'student' });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, registrationNumber: user.registrationNumber },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registrationNumber: user.registrationNumber,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    // Find courses where this student is enrolled
    const courses = await Course.find({ students: studentId })
      .populate('teacher', 'name email registrationNumber')
      .populate('timetable');
    // Collect resources from all courses
    const resources = courses.flatMap(course =>
      (course.resources || []).map(r => ({
        ...r._doc,
        course: course.title,
        courseId: course._id
      }))
    );
    // Collect timetables from all courses and populate course and teacher
    const timetableIds = courses.map(course => course.timetable).filter(Boolean);
    const timetables = await require('../models/Timetable').find({ _id: { $in: timetableIds } })
      .populate('course', 'title')
      .populate('teacher', 'name');
    
    // Generate activities from recent resources and course updates
    const activities = [];
    
    // Add recent resources as activities
    const recentResources = resources
      .filter(r => new Date(r.uploadedAt || Date.now()) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
      .map(r => ({
        type: 'resource',
        title: 'New Resource Available',
        message: `${r.filename} has been uploaded`,
        course: r.course,
        teacher: courses.find(c => c._id.toString() === r.courseId?.toString())?.teacher?.name,
        timestamp: r.uploadedAt || new Date()
      }));
    
    activities.push(...recentResources);
    
    // Add course announcements (placeholder for future implementation)
    const courseAnnouncements = courses.map(course => ({
      type: 'announcement',
      title: 'Course Update',
      message: `Welcome to ${course.title}! Course materials are now available.`,
      course: course.title,
      teacher: course.teacher?.name,
      timestamp: course.createdAt || new Date()
    }));
    
    activities.push(...courseAnnouncements.slice(0, 3)); // Limit to 3 announcements
    
    // Sort activities by timestamp (newest first)
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    res.json({
      courses: courses.map(c => ({
        id: c._id,
        title: c.title,
        description: c.description,
        teacher: c.teacher,
        resources: c.resources || [], // Add resources to each course
      })),
      resources,
      timetables,
      activities: activities.slice(0, 10) // Limit to 10 most recent activities
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.profile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password -otp -otpExpires');
    res.json(student);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.studyBot = async (req, res) => {
  // TODO: Fetch or update study bot notes
  res.json({ message: 'Study bot notes (placeholder)' });
};

exports.timetable = async (req, res) => {
  try {
    const studentId = req.user.id;
    console.log('Student timetable request for studentId:', studentId);
    
    // Find all timetables where this student is enrolled
    const directTimetables = await Timetable.find({ students: studentId })
      .populate('course', 'title')
      .populate('teacher', 'name');
    
    // Also find timetables for courses where the student is enrolled
    const studentCourses = await Course.find({ students: studentId }).populate('timetable');
    const courseTimetables = await Timetable.find({ 
      course: { $in: studentCourses.map(c => c._id) }
    })
    .populate('course', 'title')
    .populate('teacher', 'name');
    
    // Combine and deduplicate timetables
    const allTimetables = [...directTimetables, ...courseTimetables];
    const uniqueTimetables = allTimetables.filter((t, index, self) => 
      index === self.findIndex(tt => tt._id.toString() === t._id.toString())
    );
    
    console.log('Found timetables for student:', uniqueTimetables.length);
    console.log('Student courses:', studentCourses.length);
    res.json({ timetables: uniqueTimetables });
  } catch (err) {
    console.error('Student timetable error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email, role: 'student' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();
    await sendEmail(email, 'LMS Password Reset OTP', `Your OTP is: ${otp}`);
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { regNumber, otp, newPassword } = req.body;
    if (!regNumber || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ registrationNumber: regNumber, role: 'student' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }
    const user = await User.findOne({ email, role: 'student' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || !user.otpExpires || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    res.json({ message: 'OTP verified' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.messages = async (req, res) => {
  try {
    const studentId = req.user.id;
    // Find messages where the student is a recipient
    const messages = await Message.find({ recipients: studentId })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('sender', 'name');
    res.json({ messages: messages.map(m => ({
      id: m._id,
      content: m.content,
      sender: m.sender?.name || 'Teacher',
      createdAt: m.createdAt
    })) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.addCourseComment = async (req, res) => {
  try {
    const { courseId, text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.comments.push({ user: req.user.id, text });
    await course.save();
    await course.populate('comments.user', 'name');
    res.json({ comments: course.comments.map(comment => ({
      user: comment.user?.name || 'Unknown',
      text: comment.text,
      createdAt: comment.createdAt
    })) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getCourseComments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate('comments.user', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({ comments: course.comments.map(comment => ({
      user: comment.user?.name || 'Unknown',
      text: comment.text,
      createdAt: comment.createdAt
    })) });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 
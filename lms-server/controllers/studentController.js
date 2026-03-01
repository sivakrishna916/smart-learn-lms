const User = require('../models/User');
const Course = require('../models/Course');
const Timetable = require('../models/Timetable');
const Message = require('../models/Message');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { getStudyHelp } = require('../utils/aiTutor');
const { getJwtSecretOrThrow } = require('../utils/jwt');

/* ------------------ HELPERS ------------------ */
function generateRegistrationNumber() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/* ------------------ AUTH ------------------ */
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const registrationNumber = generateRegistrationNumber();

    await User.create({
      name,
      email,
      password: hashed,
      registrationNumber,
      role: 'student',
      emailVerified: true,
    });

    res.status(201).json({
      message: 'Registration successful',
      registrationNumber,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { regNumber, password } = req.body;

    const user = await User.findOne({
      registrationNumber: regNumber,
      role: 'student',
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      getJwtSecretOrThrow(),
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        registrationNumber: user.registrationNumber,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ------------------ STUDY BOT ------------------ */
exports.studyBot = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ message: 'Prompt is required' });
    }

    const studentId = req.user.id;

    const courses = await Course.find({ students: studentId }).select('title');
    const timetables = await Timetable.find({ students: studentId }).select('schedule');

    const context = {
      courses: courses.map(c => c.title),
      nextClass: timetables[0]?.schedule?.[0]?.day || 'your next class',
    };

    const result = await getStudyHelp({ prompt, context });

    res.json({
      source: result.source,
      prompt,
      answer: result.answer,
      context,
    });
  } catch (err) {
    console.error('Study bot error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ------------------ PROFILE ------------------ */
exports.profile = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');
    res.json(student);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ------------------ MESSAGES ------------------ */
exports.messages = async (req, res) => {
  try {
    const messages = await Message.find({ recipients: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ messages });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
/* ------------------ DASHBOARD ------------------ */
exports.dashboard = async (req, res) => {
  try {
    const studentId = req.user.id;
    const courses = await Course.find({ students: studentId })
      .populate('teacher', 'name email');
    const resources = courses.flatMap(course =>
      (course.resources || []).map(r => ({
        ...r._doc,
        course: course.title,
        courseId: course._id
      }))
    );
    res.json({
      courses: courses.map(c => ({
        id: c._id,
        title: c.title,
        description: c.description,
        teacher: c.teacher,
        resources: c.resources || [],
      })),
      resources,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ------------------ TIMETABLE ------------------ */
exports.timetable = async (req, res) => {
  try {
    const studentId = req.user.id;
    const timetables = await Timetable.find({ students: studentId })
      .populate('course', 'title')
      .populate('teacher', 'name');
    res.json({ timetables });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ------------------ PASSWORD ------------------ */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });
    const user = await User.findOne({ email, role: 'student' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000;
    await user.save();
    res.json({ message: 'OTP generated', otp }); // remove otp from response in production
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { regNumber, otp, newPassword } = req.body;
    const user = await User.findOne({ registrationNumber: regNumber, role: 'student' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email, role: 'student' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }
    res.json({ message: 'OTP verified' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

/* ------------------ COMMENTS ------------------ */
exports.addCourseComment = async (req, res) => {
  try {
    const { courseId, text } = req.body;
    if (!text) return res.status(400).json({ message: 'Comment text is required' });
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    course.comments.push({ user: req.user.id, text });
    await course.save();
    await course.populate('comments.user', 'name');
    res.json({
      comments: course.comments.map(c => ({
        user: c.user?.name || 'Unknown',
        text: c.text,
        createdAt: c.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCourseComments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).populate('comments.user', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json({
      comments: course.comments.map(c => ({
        user: c.user?.name || 'Unknown',
        text: c.text,
        createdAt: c.createdAt
      }))
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
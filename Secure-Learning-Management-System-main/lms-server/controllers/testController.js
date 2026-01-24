const Test = require('../models/Test');
const Submission = require('../models/Submission');
const Course = require('../models/Course');
const User = require('../models/User');

// Teacher: Create a new test
exports.createTest = async (req, res) => {
  try {
    const { title, description, course, questions, duration, expiry } = req.body;
    const test = await Test.create({
      title,
      description,
      course,
      questions,
      duration,
      createdBy: req.user.id,
      expiry: expiry ? new Date(expiry) : undefined,
    });
    res.status(201).json({ message: 'Test created', test });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Remove expired tests utility
async function removeExpiredTests() {
  const now = new Date();
  await Test.deleteMany({ expiry: { $lte: now } });
}

// Teacher: Publish/unpublish test
exports.publishTest = async (req, res) => {
  try {
    const { testId, published } = req.body;
    const test = await Test.findById(testId);
    if (!test) return res.status(404).json({ message: 'Test not found' });
    test.published = published;
    await test.save();
    res.json({ message: 'Test updated', test });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Teacher: Get all tests for their courses
exports.getTeacherTests = async (req, res) => {
  try {
    await removeExpiredTests();
    const teacherId = req.user.id;
    const courses = await Course.find({ teacher: teacherId }).select('_id');
    const courseIds = courses.map(c => c._id);
    const tests = await Test.find({ course: { $in: courseIds } });
    res.json({ tests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Student: Get available tests for their courses
exports.getStudentTests = async (req, res) => {
  try {
    await removeExpiredTests();
    const studentId = req.user.id;
    const courses = await Course.find({ students: studentId }).select('_id');
    const courseIds = courses.map(c => c._id);
    const tests = await Test.find({ course: { $in: courseIds }, published: true });
    res.json({ tests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Student: Submit test answers
exports.submitTest = async (req, res) => {
  try {
    const { testId, answers } = req.body;
    const studentId = req.user.id;
    // Prevent duplicate submissions
    const existing = await Submission.findOne({ test: testId, student: studentId });
    if (existing) return res.status(400).json({ message: 'Already submitted' });
    // Auto-grade MCQs
    const test = await Test.findById(testId);
    let totalMarks = 0;
    const gradedAnswers = answers.map(ans => {
      const q = test.questions.id(ans.questionId);
      if (q.type === 'mcq') {
        const correct = ans.answer === q.correctAnswer;
        const marks = correct ? 1 : 0;
        totalMarks += marks;
        return { ...ans, marks };
      } else {
        return { ...ans, marks: null };
      }
    });
    const submission = await Submission.create({
      test: testId,
      student: studentId,
      answers: gradedAnswers,
      totalMarks,
      graded: false,
    });
    res.status(201).json({ message: 'Test submitted', submission });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Teacher: Grade theory answers
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId, gradedAnswers } = req.body;
    const submission = await Submission.findById(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });
    let totalMarks = 0;
    submission.answers = submission.answers.map(ans => {
      const graded = gradedAnswers.find(g => g.questionId === String(ans.questionId));
      if (graded) {
        ans.marks = graded.marks;
        ans.feedback = graded.feedback;
      }
      totalMarks += ans.marks || 0;
      return ans;
    });
    submission.totalMarks = totalMarks;
    submission.graded = true;
    await submission.save();
    res.json({ message: 'Submission graded', submission });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Student: View their results
exports.getStudentResults = async (req, res) => {
  try {
    const studentId = req.user.id;
    const submissions = await Submission.find({ student: studentId }).populate('test');
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Teacher: View all results for their tests
exports.getTeacherResults = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const courses = await Course.find({ teacher: teacherId }).select('_id');
    const courseIds = courses.map(c => c._id);
    const tests = await Test.find({ course: { $in: courseIds } }).select('_id');
    const testIds = tests.map(t => t._id);
    const submissions = await Submission.find({ test: { $in: testIds } }).populate('student test');
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Admin: View all results
exports.getAllResults = async (req, res) => {
  try {
    const submissions = await Submission.find().populate('student test');
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 
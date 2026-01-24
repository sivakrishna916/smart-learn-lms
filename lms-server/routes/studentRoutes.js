const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Note = require('../models/Note');
const Reminder = require('../models/Reminder');

// Study Bot routes
router.get('/notes', authenticateToken, async (req, res) => {
  try {
    const notes = await Note.find({ student: req.user.id }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

router.post('/notes', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const note = new Note({
      content,
      student: req.user.id,
      createdAt: new Date()
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error creating note' });
  }
});

router.delete('/notes/:id', authenticateToken, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ 
      _id: req.params.id, 
      student: req.user.id 
    });
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

router.get('/reminders', authenticateToken, async (req, res) => {
  try {
    const reminders = await Reminder.find({ student: req.user.id }).sort({ dueDate: 1 });
    res.json(reminders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reminders' });
  }
});

router.post('/reminders', authenticateToken, async (req, res) => {
  try {
    const { content, dueDate } = req.body;
    const reminder = new Reminder({
      content,
      dueDate,
      student: req.user.id,
      createdAt: new Date()
    });
    await reminder.save();
    res.status(201).json(reminder);
  } catch (error) {
    res.status(500).json({ message: 'Error creating reminder' });
  }
});

router.delete('/reminders/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndDelete({ 
      _id: req.params.id, 
      student: req.user.id 
    });
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }
    res.json({ message: 'Reminder deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting reminder' });
  }
});

module.exports = router; 
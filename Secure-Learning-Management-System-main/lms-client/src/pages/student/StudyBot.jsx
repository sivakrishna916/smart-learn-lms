import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import Loader from '../../components/shared/Loader';

export default function StudyBot() {
  const { token } = useAuth();
  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [newReminder, setNewReminder] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('notes');

  useEffect(() => {
    fetchNotes();
    fetchReminders();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await api.get('/student/notes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(response.data || []);
    } catch (error) {
      console.log('No notes found or error fetching notes');
      setNotes([]);
    }
  };

  const fetchReminders = async () => {
    try {
      const response = await api.get('/student/reminders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(response.data || []);
    } catch (error) {
      console.log('No reminders found or error fetching reminders');
      setReminders([]);
    }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    setLoading(true);
    try {
      const response = await api.post('/student/notes', 
        { content: newNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotes([...notes, response.data]);
      setNewNote('');
    } catch (error) {
      console.error('Error adding note:', error);
    } finally {
      setLoading(false);
    }
  };

  const addReminder = async (e) => {
    e.preventDefault();
    if (!newReminder.trim() || !reminderDate) return;

    setLoading(true);
    try {
      const response = await api.post('/student/reminders', 
        { 
          content: newReminder, 
          dueDate: reminderDate 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReminders([...reminders, response.data]);
      setNewReminder('');
      setReminderDate('');
    } catch (error) {
      console.error('Error adding reminder:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      await api.delete(`/student/notes/${noteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotes(notes.filter(note => note._id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const deleteReminder = async (reminderId) => {
    try {
      await api.delete(`/student/reminders/${reminderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReminders(reminders.filter(reminder => reminder._id !== reminderId));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-orange text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🤖</div>
            <div>
              <h1 className="text-2xl font-bold">Study Bot</h1>
              <p className="text-orange-100">Your personal study assistant</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'notes' 
                ? 'text-orange border-b-2 border-orange bg-orange/5' 
                : 'text-gray-600 hover:text-orange'
            }`}
          >
            📝 Notes
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`flex-1 py-4 px-6 font-medium transition-colors ${
              activeTab === 'reminders' 
                ? 'text-orange border-b-2 border-orange bg-orange/5' 
                : 'text-gray-600 hover:text-orange'
            }`}
          >
            ⏰ Reminders
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'notes' ? (
            <div>
              {/* Add Note Form */}
              <form onSubmit={addNote} className="mb-6">
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a new note..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
                    disabled={loading}
                  />
                  <button
                    type="submit"
                    disabled={loading || !newNote.trim()}
                    className="bg-orange text-white px-6 py-2 rounded-lg hover:bg-orange-dark transition disabled:opacity-50"
                  >
                    {loading ? 'Adding...' : 'Add Note'}
                  </button>
                </div>
              </form>

              {/* Notes List */}
              <div className="space-y-3">
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <div key={note._id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-gray-800">{note.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(note.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteNote(note._id)}
                        className="ml-3 text-red-500 hover:text-red-700 transition"
                        title="Delete note"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-lg mb-2">No notes yet</div>
                    <div className="text-sm">Start adding your study notes above!</div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              {/* Add Reminder Form */}
              <form onSubmit={addReminder} className="mb-6">
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                    placeholder="Add a new reminder..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
                    disabled={loading}
                  />
                  <div className="flex space-x-3">
                    <input
                      type="datetime-local"
                      value={reminderDate}
                      onChange={(e) => setReminderDate(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange focus:border-transparent"
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || !newReminder.trim() || !reminderDate}
                      className="bg-orange text-white px-6 py-2 rounded-lg hover:bg-orange-dark transition disabled:opacity-50"
                    >
                      {loading ? 'Adding...' : 'Add Reminder'}
                    </button>
                  </div>
                </div>
              </form>

              {/* Reminders List */}
              <div className="space-y-3">
                {reminders.length > 0 ? (
                  reminders.map((reminder) => (
                    <div key={reminder._id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-gray-800">{reminder.content}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Due: {new Date(reminder.dueDate).toLocaleString()}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteReminder(reminder._id)}
                        className="ml-3 text-red-500 hover:text-red-700 transition"
                        title="Delete reminder"
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-lg mb-2">No reminders yet</div>
                    <div className="text-sm">Start adding your study reminders above!</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
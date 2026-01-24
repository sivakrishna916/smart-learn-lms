import React, { useEffect, useState } from 'react';
import Loader from '../../components/shared/Loader';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function StudentDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      setError('');
      try {
        const res = await api.get('/student/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data || {});
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, [token]);

  // Filter today's classes
  const getTodayClasses = () => {
    if (!data || !Array.isArray(data.timetables)) return [];
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return data.timetables.filter(t =>
      Array.isArray(t.schedule) && t.schedule.some(slot => slot && slot.day === today)
    );
  };

  const todayClasses = getTodayClasses();

  if (loading) return <Loader />;
  if (error) return <div className="text-red-600 text-center mt-8">{error}</div>;
  if (!data) return null;

  return (
    <div className="relative max-w-6xl mx-auto mt-8 px-4">
      {/* Study Bot - Fixed in corner */}
      <div className="fixed bottom-6 right-6 z-50">
        <a 
          href="/student/studybot" 
          className="bg-orange text-white rounded-full p-4 shadow-lg hover:bg-orange-dark transition-all duration-300 transform hover:scale-110 flex flex-col items-center"
          title="Study Bot - Save notes and reminders"
        >
          <div className="text-2xl mb-1">🤖</div>
          <div className="text-xs font-medium">Study Bot</div>
        </a>
      </div>

      <h1 className="text-2xl font-bold text-orange mb-6">Student Dashboard</h1>
      
      {/* Activities/Notifications Section */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg text-orange">Recent Activities & Updates</h2>
          <div className="bg-orange text-white px-3 py-1 rounded-full text-sm font-medium">
            {Array.isArray(data.activities) ? data.activities.length : 0} new
          </div>
        </div>
        
        <div className="space-y-4">
          {Array.isArray(data.activities) && data.activities.length > 0 ? (
            data.activities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange/5 rounded-lg border-l-4 border-orange">
                <div className="text-orange text-lg">
                  {activity.type === 'resource' && '📚'}
                  {activity.type === 'announcement' && '📢'}
                  {activity.type === 'assignment' && '📝'}
                  {activity.type === 'grade' && '📊'}
                  {!activity.type && '🔔'}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{activity.title || 'New Update'}</div>
                  <div className="text-sm text-gray-600">{activity.message || activity.description}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {activity.course && `Course: ${activity.course}`}
                    {activity.teacher && ` • Teacher: ${activity.teacher}`}
                    {activity.timestamp && ` • ${new Date(activity.timestamp).toLocaleDateString()}`}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <div className="text-lg mb-2">No recent activities</div>
              <div className="text-sm">Updates from teachers will appear here</div>
            </div>
          )}
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-2">Enrolled Courses</h2>
          <ul className="list-disc ml-5 text-gray-700">
            {Array.isArray(data.courses) && data.courses.length ? data.courses.map(c => (
              <li key={c.id || c._id}>{c.title} <span className="text-xs text-gray-500">({c.teacher?.name || 'Unknown'})</span></li>
            )) : <li>No courses enrolled.</li>}
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="font-semibold mb-2">Resources</h2>
          <ul className="list-disc ml-5 text-gray-700">
            {Array.isArray(data.resources) && data.resources.length ? data.resources.map((r, i) => (
              <li key={r.id || r._id || i}>{r.filename} <span className="text-xs text-gray-500">({r.course || 'General'})</span></li>
            )) : <li>No resources available.</li>}
          </ul>
        </div>
      </div>

      {/* Today's Classes Section */}
      <div className="bg-white rounded-xl shadow p-6 mt-6">
        <h2 className="font-semibold mb-4 text-orange">Today's Classes</h2>
        {todayClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayClasses.map((t, i) => (
              <div key={t._id || i} className="bg-orange/5 rounded-lg p-4 border border-orange/20">
                <div className="text-lg font-semibold text-orange mb-2">{t?.course?.title || 'Unknown Course'}</div>
                <div className="text-gray-700 mb-1">
                  <span className="font-medium">Teacher:</span> {t?.teacher?.name || 'Unknown'}
                </div>
                {Array.isArray(t.schedule) && t.schedule.filter(slot => {
                  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
                  return slot && slot.day === today;
                }).map((slot, slotIndex) => (
                  <div key={slotIndex} className="text-gray-700">
                    <div><span className="font-medium">Time:</span> {slot.startTime || '-'} - {slot.endTime || '-'}</div>
                    {slot.notes && (
                      <div className="text-gray-600 text-sm mt-1">
                        <span className="font-medium">Notes:</span> {slot.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-500 text-lg mb-2">No classes scheduled for today</div>
            <div className="text-gray-400 text-sm">Enjoy your free time! 📚</div>
          </div>
        )}
      </div>
    </div>
  );
} 
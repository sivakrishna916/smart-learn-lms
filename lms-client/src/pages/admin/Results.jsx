import React, { useEffect, useState } from 'react';
import Loader from '../../components/shared/Loader';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminResults() {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const res = await api.get('/admin/results', { headers: { Authorization: `Bearer ${token}` } });
        setSubmissions(res.data.submissions || []);
      } catch (err) {
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [token]);

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-orange mb-6">All Test Results</h1>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-orange">All Submissions</h2>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-orange/10">
              <th className="p-2">Student</th>
              <th className="p-2">Test</th>
              <th className="p-2">Total Marks</th>
              <th className="p-2">Graded</th>
              <th className="p-2">Details</th>
            </tr>
          </thead>
          <tbody>
            {submissions.length ? submissions.map(sub => (
              <tr key={sub._id}>
                <td className="p-2">{sub.student?.name}</td>
                <td className="p-2">{sub.test?.title}</td>
                <td className="p-2">{sub.totalMarks ?? '-'}</td>
                <td className="p-2">{sub.graded ? 'Yes' : 'No'}</td>
                <td className="p-2">
                  <details>
                    <summary className="cursor-pointer text-orange">View</summary>
                    <ul className="ml-4 mt-2">
                      {sub.answers.map((ans, i) => (
                        <li key={i} className="mb-2">
                          <div className="font-semibold">Q: {sub.test?.questions.find(q => String(q._id) === String(ans.questionId))?.text}</div>
                          <div>Answer: {ans.answer}</div>
                          {ans.marks !== undefined && <div>Marks: {ans.marks}</div>}
                          {ans.feedback && <div>Feedback: {ans.feedback}</div>}
                        </li>
                      ))}
                    </ul>
                  </details>
                </td>
              </tr>
            )) : <tr><td colSpan={5} className="p-2 text-center">No submissions found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
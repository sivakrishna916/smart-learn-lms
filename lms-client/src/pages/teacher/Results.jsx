import React, { useEffect, useState } from 'react';
import Loader from '../../components/shared/Loader';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function TeacherResults() {
  const { token } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(null); // submission being graded
  const [gradedAnswers, setGradedAnswers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    async function fetchResults() {
      setLoading(true);
      try {
        const res = await api.get('/teacher/results', { headers: { Authorization: `Bearer ${token}` } });
        setSubmissions(res.data.submissions || []);
      } catch (err) {
        setError('Failed to load results');
      } finally {
        setLoading(false);
      }
    }
    fetchResults();
  }, [token, success]);

  // Start grading a submission
  const startGrading = (submission) => {
    setGrading(submission);
    setGradedAnswers(submission.answers.map(ans => ({
      questionId: ans.questionId,
      marks: ans.marks || '',
      feedback: ans.feedback || ''
    })));
    setError('');
    setSuccess('');
  };

  // Handle grading input
  const handleGradeChange = (idx, field, value) => {
    setGradedAnswers(ga => ga.map((a, i) => i === idx ? { ...a, [field]: value } : a));
  };

  // Submit grading
  const submitGrading = async () => {
    try {
      await api.post('/teacher/grade-submission', {
        submissionId: grading._id,
        gradedAnswers,
      }, { headers: { Authorization: `Bearer ${token}` } });
      setSuccess('Submission graded!');
      setGrading(null);
    } catch (err) {
      setError('Failed to grade submission');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <h1 className="text-2xl font-bold text-orange mb-6">Test Results</h1>
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      {success && <div className="text-green-600 text-sm mb-3">{success}</div>}
      {grading ? (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-orange">Grading Submission</h2>
          <div className="mb-2">Student: {grading.student?.name}</div>
          <div className="mb-2">Test: {grading.test?.title}</div>
          <form onSubmit={e => { e.preventDefault(); submitGrading(); }}>
            {grading.answers.map((ans, i) => (
              <div key={ans.questionId} className="mb-4 p-2 border rounded">
                <div className="font-semibold">Q: {grading.test?.questions.find(q => String(q._id) === String(ans.questionId))?.text}</div>
                <div className="mb-1">Student Answer: {ans.answer}</div>
                {grading.test?.questions.find(q => String(q._id) === String(ans.questionId))?.type === 'theory' && (
                  <>
                    <input type="number" placeholder="Marks" value={gradedAnswers[i].marks} onChange={e => handleGradeChange(i, 'marks', e.target.value)} className="border rounded px-2 py-1 mr-2" min={0} />
                    <input type="text" placeholder="Feedback" value={gradedAnswers[i].feedback} onChange={e => handleGradeChange(i, 'feedback', e.target.value)} className="border rounded px-2 py-1" />
                  </>
                )}
                {grading.test?.questions.find(q => String(q._id) === String(ans.questionId))?.type === 'mcq' && (
                  <div className="text-green-700">Auto-graded: {ans.marks} mark(s)</div>
                )}
              </div>
            ))}
            <button type="submit" className="bg-orange text-white px-4 py-2 rounded mt-2">Submit Grades</button>
            <button type="button" className="ml-2 px-4 py-2 rounded bg-gray-300" onClick={() => setGrading(null)}>Cancel</button>
          </form>
        </div>
      ) : null}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-orange">All Submissions</h2>
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-orange/10">
              <th className="p-2">Student</th>
              <th className="p-2">Test</th>
              <th className="p-2">Total Marks</th>
              <th className="p-2">Graded</th>
              <th className="p-2">Action</th>
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
                  {!sub.graded && <button className="bg-orange text-white px-3 py-1 rounded" onClick={() => startGrading(sub)}>Grade</button>}
                </td>
              </tr>
            )) : <tr><td colSpan={5} className="p-2 text-center">No submissions found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
} 
const test = require('node:test');
const assert = require('node:assert/strict');

const { calculateSubmissionMetrics, buildPerformanceSummary } = require('../utils/performance');

test('calculateSubmissionMetrics auto-grades MCQ with maxMarks and returns percentage', () => {
  const testDoc = {
    questions: [
      { _id: 'q1', type: 'mcq', correctAnswer: 'A', maxMarks: 2 },
      { _id: 'q2', type: 'mcq', correctAnswer: 'B' },
    ],
  };

  const metrics = calculateSubmissionMetrics(testDoc, [
    { questionId: 'q1', answer: 'A' },
    { questionId: 'q2', answer: 'C' },
  ]);

  assert.equal(metrics.totalMarks, 2);
  assert.equal(metrics.maxMarks, 3);
  assert.equal(metrics.percentage, 66.67);
  assert.equal(metrics.fullyGraded, true);
});

test('buildPerformanceSummary aggregates averages and pass rate', () => {
  const summary = buildPerformanceSummary([
    { percentage: 80 },
    { percentage: 40 },
    { percentage: 20 },
  ]);

  assert.equal(summary.testsTaken, 3);
  assert.equal(summary.averagePercentage, 46.67);
  assert.equal(summary.bestPercentage, 80);
  assert.equal(summary.passRate, 66.67);
});

const test = require('node:test');
const assert = require('node:assert/strict');

const { buildFallbackStudyPlan, generateStudyGuidance } = require('../utils/aiTutor');

test('buildFallbackStudyPlan returns actionable non-empty text', () => {
  const output = buildFallbackStudyPlan({
    question: 'How can I improve in algebra?',
    courses: [{ title: 'Mathematics' }],
  });

  assert.ok(output.includes('algebra'));
  assert.ok(output.includes('Mathematics'));
});

test('generateStudyGuidance uses fallback when API key is missing', async () => {
  const previous = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;

  try {
    const result = await generateStudyGuidance({
      question: 'Prepare me for my test',
      studentName: 'Alex',
      courses: [{ title: 'Physics' }],
      upcomingClasses: ['Physics - Monday 09:00-10:00'],
    });

    assert.equal(result.source, 'fallback');
    assert.ok(result.answer.includes('Prepare me for my test'));
  } finally {
    if (previous) process.env.OPENAI_API_KEY = previous;
  }
});

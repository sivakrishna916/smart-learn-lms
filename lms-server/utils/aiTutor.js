const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

function buildFallbackStudyPlan({ question, courses }) {
  const topCourses = courses.slice(0, 3).map((course) => course.title).join(', ');
  return [
    `I could not reach the AI provider, so here is a smart fallback plan for: "${question}".`,
    topCourses ? `Focus first on these courses: ${topCourses}.` : 'Focus first on your currently enrolled course topics.',
    'Study plan: 25 minutes concept review, 20 minutes practice questions, 10 minutes recap notes.',
    'Share your weak topic and I can generate a targeted revision checklist.',
  ].join(' ');
}

async function generateStudyGuidance({ question, studentName, courses, upcomingClasses }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

  if (!apiKey) {
    return {
      source: 'fallback',
      answer: buildFallbackStudyPlan({ question, courses }),
    };
  }

  const systemPrompt = `You are an LMS study coach. Give concise and practical guidance.
Student: ${studentName}.
Courses: ${courses.map((c) => c.title).join(', ') || 'Not available'}.
Upcoming classes: ${upcomingClasses.join('; ') || 'Not available'}.`;

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question },
      ],
      temperature: 0.4,
      max_tokens: 400,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI provider failed with status ${response.status}`);
  }

  const data = await response.json();
  const answer = data?.choices?.[0]?.message?.content?.trim();
  if (!answer) {
    throw new Error('AI provider returned empty response');
  }

  return { source: 'ai', answer };
}

module.exports = {
  generateStudyGuidance,
  buildFallbackStudyPlan,
};

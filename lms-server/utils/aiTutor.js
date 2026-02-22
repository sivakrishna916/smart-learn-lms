const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const DEFAULT_BASE_URL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

async function getStudyHelp({ prompt, context }) {
  const apiKey = process.env.OPENAI_API_KEY;
  const fallbackAnswer = buildFallbackPlan(prompt, context);

  if (!apiKey) {
    return { source: 'fallback', answer: fallbackAnswer };
  }

  try {
    const response = await fetch(`${DEFAULT_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a concise LMS study coach helping students plan practical study sessions.',
          },
          {
            role: 'user',
            content: `Student context: ${JSON.stringify(context)}\n\nQuestion: ${prompt}`,
          },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI provider failed with status ${response.status}`);
    }

    const data = await response.json();
    const answer = data?.choices?.[0]?.message?.content?.trim();

    if (!answer) {
      return { source: 'fallback', answer: fallbackAnswer };
    }

    return { source: 'ai', answer };
  } catch (error) {
    console.error('AI tutor error:', error);
    return { source: 'fallback', answer: fallbackAnswer };
  }
}

function buildFallbackPlan(prompt, context) {
  const courses = (context.courses || []).slice(0, 3).join(', ') || 'your enrolled courses';
  const nextClass = context.nextClass || 'your next available study slot';

  return `Based on ${courses}, focus first on the topic related to "${prompt}" for 25 minutes. Then review class notes before ${nextClass}, and finish with 5 practice questions. Keep your final 10 minutes for revision and doubts.`;
}

module.exports = { getStudyHelp, buildFallbackPlan };

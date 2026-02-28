const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

async function getStudyHelp({ prompt, context }) {
  const fallbackAnswer = buildFallbackPlan(prompt, context);

  if (!process.env.CLAUDE_API_KEY) {
    return { source: 'fallback', answer: fallbackAnswer };
  }

  try {
    const courses = (context.courses || []).join(', ') || 'your enrolled courses';
    const nextClass = context.nextClass || 'your next class';

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a helpful study assistant for students in a Learning Management System.
          
Student's enrolled courses: ${courses}
Next class: ${nextClass}

Student question: ${prompt}

Give a clear, practical, and encouraging response. Keep it concise and student-friendly.`,
        },
      ],
    });

    const answer = message.content[0].text;
    return { source: 'ai', answer };

  } catch (error) {
    console.error('Claude AI error:', error);
    return { source: 'fallback', answer: fallbackAnswer };
  }
}

function buildFallbackPlan(prompt, context) {
  const courses = (context.courses || []).slice(0, 3).join(', ') || 'your enrolled courses';
  const nextClass = context.nextClass || 'your next available study slot';
  return `Based on ${courses}, focus first on the topic related to "${prompt}" for 25 minutes. Then review class notes before ${nextClass}, and finish with 5 practice questions.`;
}

module.exports = { getStudyHelp, buildFallbackPlan };
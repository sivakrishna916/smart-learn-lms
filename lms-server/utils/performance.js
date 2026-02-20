function getQuestionMaxMarks(question) {
  if (!question) return 0;
  if (typeof question.maxMarks === 'number' && question.maxMarks > 0) {
    return question.maxMarks;
  }
  return question.type === 'mcq' ? 1 : 0;
}

function calculateSubmissionMetrics(test, answers = []) {
  const questionsById = new Map((test?.questions || []).map((q) => [String(q._id), q]));

  let totalMarks = 0;
  let maxMarks = 0;

  const gradedAnswers = answers.map((answer) => {
    const question = questionsById.get(String(answer.questionId));
    if (!question) {
      return { ...answer, marks: 0, feedback: 'Question not found' };
    }

    const questionMaxMarks = getQuestionMaxMarks(question);
    maxMarks += questionMaxMarks;

    if (question.type === 'mcq') {
      const isCorrect = answer.answer === question.correctAnswer;
      const marks = isCorrect ? questionMaxMarks : 0;
      totalMarks += marks;
      return { ...answer, marks, feedback: isCorrect ? 'Correct' : 'Incorrect' };
    }

    return { ...answer, marks: null };
  });

  for (const question of test?.questions || []) {
    const wasAnswered = answers.some((answer) => String(answer.questionId) === String(question._id));
    if (!wasAnswered) {
      maxMarks += getQuestionMaxMarks(question);
    }
  }

  const hasTheoryQuestions = (test?.questions || []).some((q) => q.type === 'theory');

  return {
    gradedAnswers,
    totalMarks,
    maxMarks,
    percentage: maxMarks > 0 ? Number(((totalMarks / maxMarks) * 100).toFixed(2)) : 0,
    fullyGraded: !hasTheoryQuestions,
  };
}

function buildPerformanceSummary(submissions = [], passThreshold = 40) {
  const totalSubmissions = submissions.length;
  if (!totalSubmissions) {
    return {
      testsTaken: 0,
      averagePercentage: 0,
      bestPercentage: 0,
      passRate: 0,
    };
  }

  const percentages = submissions.map((submission) => {
    if (typeof submission.percentage === 'number') return submission.percentage;
    const maxMarks = submission.maxMarks || 0;
    if (!maxMarks) return 0;
    return Number((((submission.totalMarks || 0) / maxMarks) * 100).toFixed(2));
  });

  const passes = percentages.filter((value) => value >= passThreshold).length;

  return {
    testsTaken: totalSubmissions,
    averagePercentage: Number((percentages.reduce((sum, value) => sum + value, 0) / totalSubmissions).toFixed(2)),
    bestPercentage: Number(Math.max(...percentages).toFixed(2)),
    passRate: Number(((passes / totalSubmissions) * 100).toFixed(2)),
  };
}

module.exports = {
  calculateSubmissionMetrics,
  buildPerformanceSummary,
};

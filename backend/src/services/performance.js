import { QuizAttempt } from '../models/Quiz.js';
export async function conceptStats(userId) {
  const attempts = await QuizAttempt.find({ user: userId, status: 'SUBMITTED' }).select('answers'), m = {};
  for (const a of attempts) for (const x of a.answers) { if (!x.concept) continue; const c = (m[x.concept] ||= { right: 0, total: 0 }); c.total++; if (x.correct) c.right++; }
  return Object.entries(m).map(([concept, v]) => ({ concept, ...v, pct: Math.round((v.right / v.total) * 100) })).sort((a, b) => a.pct - b.pct);
}
export async function quizSummary(userId) {
  const at = await QuizAttempt.find({ user: userId, status: 'SUBMITTED' }).sort('-submittedAt').populate('quiz', 'title').lean();
  return { attempts: at.length, avg: at.length ? Math.round(at.reduce((s, a) => s + a.percentage, 0) / at.length) : null, passed: at.filter((a) => a.passed).length, failed: at.filter((a) => !a.passed).length,
    recent: at.slice(0, 5).map((a) => ({ _id: a._id, quiz: a.quiz?.title, percentage: a.percentage, passed: a.passed, submittedAt: a.submittedAt, weakConcepts: a.weakConcepts })) };
}

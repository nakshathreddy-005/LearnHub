import { Quiz, Question, QuizAttempt } from '../models/Quiz.js';
import { Enrollment } from '../models/Learning.js';
import { err, wrap } from '../utils/http.js';
import { check } from '../validators/index.js';
import { owned } from './courseController.js';
import { notify } from '../services/notify.js';
import { checkCompletion } from '../services/completion.js';
const EDITABLE = ['DRAFT', 'CHANGES_REQUESTED'];
const RULES = { title: { required: true, type: 'string', max: 120 }, description: { type: 'string', max: 500 }, timeLimitMin: { type: 'number', min: 0, max: 240 }, maxAttempts: { type: 'number', min: 0, max: 20 }, passPercent: { type: 'number', min: 1, max: 100 }, questionCount: { type: 'number', min: 0, max: 100 } };
const F = Object.keys(RULES), pick = (o, ks) => Object.fromEntries(ks.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
const shuffle = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
async function ownedQuiz(id, u, edit) {
  const q = await Quiz.findById(id); if (!q) throw err(404, 'Quiz not found');
  const c = await owned(q.course, u); if (edit && !EDITABLE.includes(c.status)) throw err(409, 'Quizzes can only be edited while the course is a draft or has requested changes'); return q;
}
function qData(b) {
  check(b, { text: { required: true, type: 'string', max: 600 }, explanation: { type: 'string', max: 800 }, concept: { type: 'string', max: 80 }, difficulty: { enum: ['EASY', 'MEDIUM', 'HARD'] }, correctIndex: { required: true, type: 'number', min: 0 } });
  const o = Array.isArray(b.options) ? b.options.map((x) => String(x).trim()).filter(Boolean) : [], errors = {};
  if (o.length < 2 || o.length > 6) errors.options = 'Provide 2 to 6 non-empty options'; else if (!Number.isInteger(b.correctIndex) || b.correctIndex >= o.length) errors.correctIndex = 'Choose the correct option';
  if (Object.keys(errors).length) throw Object.assign(err(400, 'Please fix the highlighted fields'), { errors });
  return { text: b.text.trim(), options: o, correctIndex: b.correctIndex, explanation: b.explanation, concept: (b.concept || 'General').trim(), difficulty: b.difficulty || 'MEDIUM' };
}
// ---- instructor ----
export const create = wrap(async (req, res) => {
  const c = await owned(req.params.id, req.user); if (!EDITABLE.includes(c.status)) throw err(409, 'Quizzes can only be added while the course is a draft or has requested changes');
  check(req.body, RULES); res.status(201).json({ quiz: await Quiz.create({ ...pick(req.body, F), course: c._id }) });
});
export const update = wrap(async (req, res) => { const q = await ownedQuiz(req.params.id, req.user, true); check(req.body, RULES); Object.assign(q, pick(req.body, F)); await q.save(); res.json({ quiz: q }); });
export const remove = wrap(async (req, res) => { const q = await ownedQuiz(req.params.id, req.user, true); await Promise.all([Question.deleteMany({ quiz: q._id }), QuizAttempt.deleteMany({ quiz: q._id }), q.deleteOne()]); res.json({ message: 'Quiz deleted' }); });
export const manageOne = wrap(async (req, res) => { const q = await ownedQuiz(req.params.id, req.user); res.json({ quiz: q, questions: await Question.find({ quiz: q._id }).sort('createdAt') }); });
export const manageList = wrap(async (req, res) => {
  await owned(req.params.id, req.user);
  res.json({ quizzes: await Promise.all((await Quiz.find({ course: req.params.id }).lean()).map(async (q) => ({ ...q, questions: await Question.countDocuments({ quiz: q._id }) }))) });
});
export const addQuestion = wrap(async (req, res) => { const q = await ownedQuiz(req.params.id, req.user, true); res.status(201).json({ question: await Question.create({ ...qData(req.body), quiz: q._id }) }); });
export const updateQuestion = wrap(async (req, res) => {
  const qu = await Question.findById(req.params.id); if (!qu) throw err(404, 'Question not found'); await ownedQuiz(qu.quiz, req.user, true);
  Object.assign(qu, qData(req.body)); await qu.save(); res.json({ question: qu });
});
export const deleteQuestion = wrap(async (req, res) => { const qu = await Question.findById(req.params.id); if (!qu) throw err(404, 'Question not found'); await ownedQuiz(qu.quiz, req.user, true); await qu.deleteOne(); res.json({ message: 'Question deleted' }); });
// ---- student ----
export const forCourse = wrap(async (req, res) => {
  if (!(await Enrollment.exists({ user: req.user._id, course: req.params.id }))) throw err(403, 'Enroll in this course first');
  res.json({ quizzes: await Promise.all((await Quiz.find({ course: req.params.id }).lean()).map(async (q) => {
    const at = await QuizAttempt.find({ user: req.user._id, quiz: q._id, status: 'SUBMITTED' }).select('percentage'), n = await Question.countDocuments({ quiz: q._id });
    return { ...q, questions: q.questionCount ? Math.min(q.questionCount, n) : n, attemptsUsed: at.length, best: at.length ? Math.max(...at.map((a) => a.percentage)) : null };
  })) });
});
async function finalize(a, quiz, input) {
  const qs = await Question.find({ _id: { $in: a.questionIds } }).lean(), by = Object.fromEntries(qs.map((q) => [String(q._id), q]));
  const sel = Object.fromEntries((Array.isArray(input) ? input : []).map((x) => [String(x.question), x.selected]));
  a.answers = a.questionIds.filter((id) => by[String(id)]).map((id) => { const q = by[String(id)], s = Number.isInteger(sel[String(id)]) ? sel[String(id)] : null; return { question: id, concept: q.concept, selected: s, correct: s === q.correctIndex }; });
  a.total = a.answers.length; a.score = a.answers.filter((x) => x.correct).length; a.percentage = a.total ? Math.round((a.score / a.total) * 100) : 0; a.passed = a.percentage >= quiz.passPercent;
  const by2 = {}; a.answers.forEach((x) => { const c = (by2[x.concept || 'General'] ||= { r: 0, t: 0 }); c.t++; if (x.correct) c.r++; });
  a.concepts = Object.keys(by2); a.weakConcepts = Object.entries(by2).filter(([, v]) => v.r / v.t < 0.6).map(([k]) => k);
  a.status = 'SUBMITTED'; a.submittedAt = new Date(); await a.save(); return a;
}
export const start = wrap(async (req, res) => {
  const quiz = await Quiz.findById(req.params.id); if (!quiz) throw err(404, 'Quiz not found');
  if (!(await Enrollment.exists({ user: req.user._id, course: quiz.course }))) throw err(403, 'Enroll in this course first');
  let a = await QuizAttempt.findOne({ user: req.user._id, quiz: quiz._id, status: 'IN_PROGRESS' });
  if (a?.expiresAt && Date.now() > a.expiresAt.getTime() + 30000) { await finalize(a, quiz, []); a = null; } // expired attempt is auto-submitted
  if (!a) {
    const used = await QuizAttempt.countDocuments({ user: req.user._id, quiz: quiz._id, status: 'SUBMITTED' });
    if (quiz.maxAttempts && used >= quiz.maxAttempts) throw err(409, 'You have used all attempts for this quiz');
    const qs = await Question.find({ quiz: quiz._id }).select('_id'); if (!qs.length) throw err(409, 'This quiz has no questions yet');
    a = await QuizAttempt.create({ user: req.user._id, quiz: quiz._id, course: quiz.course, questionIds: shuffle(qs).slice(0, quiz.questionCount || qs.length).map((q) => q._id), startedAt: new Date(), attemptNumber: used + 1, expiresAt: quiz.timeLimitMin ? new Date(Date.now() + quiz.timeLimitMin * 60000) : undefined });
  }
  const list = await Question.find({ _id: { $in: a.questionIds } }).select('text options difficulty'), by = Object.fromEntries(list.map((q) => [String(q._id), q])); // correctIndex/explanation never selected
  res.json({ attempt: { _id: a._id, expiresAt: a.expiresAt, attemptNumber: a.attemptNumber }, quiz: { title: quiz.title, passPercent: quiz.passPercent, timeLimitMin: quiz.timeLimitMin }, questions: a.questionIds.map((id) => by[String(id)]).filter(Boolean) });
});
async function result(a) {
  await a.populate('quiz', 'title passPercent'); const qs = await Question.find({ _id: { $in: a.questionIds } }).lean(), by = Object.fromEntries(qs.map((q) => [String(q._id), q]));
  return { attempt: { _id: a._id, quiz: a.quiz, score: a.score, total: a.total, percentage: a.percentage, passed: a.passed, weakConcepts: a.weakConcepts, concepts: a.concepts, submittedAt: a.submittedAt, attemptNumber: a.attemptNumber },
    review: a.answers.map((x) => { const q = by[String(x.question)] || {}; return { question: q.text, options: q.options, selected: x.selected, correctIndex: q.correctIndex, correct: x.correct, concept: x.concept, explanation: q.explanation }; }) };
}
export const submit = wrap(async (req, res) => {
  const a = await QuizAttempt.findOne({ _id: req.params.id, user: req.user._id }); if (!a) throw err(404, 'Attempt not found');
  if (a.status !== 'IN_PROGRESS') throw err(409, 'This attempt was already submitted');
  const quiz = await Quiz.findById(a.quiz), late = a.expiresAt && Date.now() > a.expiresAt.getTime() + 30000;
  await finalize(a, quiz, late ? [] : req.body.answers);
  await notify(req.user._id, 'QUIZ', `You scored ${a.percentage}% on "${quiz.title}" (${a.passed ? 'passed' : 'not passed'}).`, `/results/${a._id}`);
  if (a.weakConcepts.length) await notify(req.user._id, 'AI', `New recommendation: review ${a.weakConcepts.slice(0, 2).join(', ')}.`, '/ai');
  await checkCompletion(req.user._id, a.course);
  res.json({ ...(await result(a)), timedOut: !!late });
});
export const getAttempt = wrap(async (req, res) => {
  const a = await QuizAttempt.findOne({ _id: req.params.id, user: req.user._id }); if (!a) throw err(404, 'Attempt not found');
  if (a.status !== 'SUBMITTED') throw err(409, 'Results are available after you submit'); res.json(await result(a));
});
export const myAttempts = wrap(async (req, res) => res.json({ attempts: await QuizAttempt.find({ user: req.user._id, status: 'SUBMITTED' }).sort('-submittedAt').populate('quiz', 'title passPercent').select('quiz score total percentage passed weakConcepts submittedAt attemptNumber') }));

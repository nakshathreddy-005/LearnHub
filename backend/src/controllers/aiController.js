import { wrap } from '../utils/http.js';
import { Lesson } from '../models/Course.js';
import { Quiz, QuizAttempt } from '../models/Quiz.js';
import Certificate from '../models/Certificate.js';
import Notification from '../models/Notification.js';
import { Assignment, AssignmentSubmission } from '../models/Assignment.js';
import { MentoringSession } from '../models/Mentoring.js';
import { progressFor } from '../services/progress.js';
import { conceptStats, quizSummary } from '../services/performance.js';
import { generateLearningPath } from '../services/aiService.js';
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const learningPath = wrap(async (req, res) => {
  const [enrollments, concepts] = await Promise.all([progressFor(req.user._id), conceptStats(req.user._id)]), ids = enrollments.map((e) => e.courseId), revisions = [];
  for (const w of concepts.filter((c) => c.pct < 60).slice(0, 4)) {
    const l = await Lesson.findOne({ course: { $in: ids }, title: new RegExp(esc(w.concept), 'i') }).populate('course', 'title');
    revisions.push({ concept: w.concept, pct: w.pct, lesson: l?.title, courseId: l?.course?._id, courseTitle: l?.course?.title });
  }
  const passed = (await QuizAttempt.distinct('quiz', { user: req.user._id, passed: true })).map(String);
  const pendingQuizzes = (await Quiz.find({ course: { $in: ids } })).filter((q) => !passed.includes(String(q._id))).map((q) => ({ quizId: q._id, title: q.title, courseId: q.course }));
  const graded = await AssignmentSubmission.find({ student: req.user._id, status: 'GRADED' }).populate('assignment', 'title maximumMarks course'); const assignmentPerformance = graded.filter(s => s.assignment).map(s => ({ title: s.assignment.title, percentage: Math.round((s.marks / s.assignment.maximumMarks) * 100), courseId: s.assignment.course }));
  res.json({ ...(await generateLearningPath({ goal: String(req.query.goal || '').slice(0, 100), enrollments, concepts, revisions, pendingQuizzes, assignmentPerformance })), concepts, assignmentPerformance });
});
export const summary = wrap(async (req, res) => {
  const [quiz, concepts, enrollments, certificates, unread] = await Promise.all([quizSummary(req.user._id), conceptStats(req.user._id), progressFor(req.user._id), Certificate.countDocuments({ user: req.user._id }), Notification.countDocuments({ user: req.user._id, read: false })]);
  const ids = enrollments.map(e => e.courseId), assignments = await Assignment.find({ course: { $in: ids }, dueDate: { $gte: new Date() } }).populate('course', 'title').sort('dueDate').limit(10), submissions = await AssignmentSubmission.find({ student: req.user._id, assignment: { $in: assignments.map(a => a._id) } }); const submitted = new Map(submissions.map(s => [String(s.assignment), s])); const sessions = await MentoringSession.find({ student: req.user._id, status: 'SCHEDULED', scheduledFor: { $gte: new Date() } }).populate('mentor', 'name').sort('scheduledFor').limit(5);
  res.json({ quiz, weakConcepts: concepts.filter((c) => c.pct < 60).slice(0, 5), enrollments, certificates, unread, deadlines: assignments.map(a => ({ ...a.toJSON(), submission: submitted.get(String(a._id)) })), sessions });
});

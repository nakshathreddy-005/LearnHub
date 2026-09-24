import { Enrollment } from '../models/Learning.js';
import { Lesson, Course } from '../models/Course.js';
import { Quiz, QuizAttempt } from '../models/Quiz.js';
// Required activities = all lessons + all required quizzes (must be passed).
export async function requirements(userId, courseId) {
  const [lessons, quizzes, en, passedIds] = await Promise.all([
    Lesson.find({ course: courseId }).sort('order').select('title'), Quiz.find({ course: courseId, isRequired: true }).select('title'),
    Enrollment.findOne({ user: userId, course: courseId }), QuizAttempt.distinct('quiz', { user: userId, course: courseId, passed: true, status: 'SUBMITTED' })]);
  const done = new Set((en?.completedLessons || []).map(String)), passed = new Set(passedIds.map(String));
  return { en, lessons, quizzes, doneLessons: lessons.filter((l) => done.has(String(l._id))).length, passedQuizzes: quizzes.filter((q) => passed.has(String(q._id))).length, nextLesson: lessons.find((l) => !done.has(String(l._id))) };
}
export async function progressFor(userId) {
  const ens = await Enrollment.find({ user: userId }).populate('course', 'title');
  return Promise.all(ens.filter((e) => e.course).map(async (e) => {
    const r = await requirements(userId, e.course._id), total = r.lessons.length + r.quizzes.length, done = r.doneLessons + r.passedQuizzes;
    return { courseId: e.course._id, title: e.course.title, total, done, pct: e.completedAt ? 100 : total ? Math.round((done / total) * 100) : 0, next: r.nextLesson?.title, lessons: { done: r.doneLessons, total: r.lessons.length }, quizzes: { passed: r.passedQuizzes, total: r.quizzes.length }, completed: !!e.completedAt };
  }));
}

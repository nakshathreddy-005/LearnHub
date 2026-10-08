import { Course, Module, Lesson } from '../models/Course.js';
import { Enrollment, CourseReview } from '../models/Learning.js';
import { err, wrap } from '../utils/http.js';
import { progressFor } from '../services/progress.js';
import { notify } from '../services/notify.js';
import { checkCompletion } from '../services/completion.js';
import { audit } from '../services/audit.js';
export { progressFor };
const same = (a, b) => String(a) === String(b);
const FIELDS = ['title', 'description', 'shortDescription', 'thumbnail', 'category', 'level', 'duration', 'tags', 'learningObjectives', 'prerequisites'];
const pick = (o, ks) => Object.fromEntries(ks.filter((k) => o[k] !== undefined).map((k) => [k, o[k]]));
const esc = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export async function owned(id, u) {
  const c = await Course.findById(id); if (!c) throw err(404, 'Course not found');
  if (!same(c.instructor, u._id) && u.role !== 'ADMIN') throw err(403, 'You can only change your own courses');
  return c;
}
export const list = wrap(async (req, res) => {
  const q = { status: 'PUBLISHED' };
  if (req.query.category) q.category = req.query.category;
  if (req.query.level) q.level = req.query.level;
  if (req.query.q) q.title = new RegExp(esc(req.query.q), 'i');
  if (req.query.instructor) q.instructor = req.query.instructor;
  res.json({ courses: await Course.find(q).populate('instructor', 'name').sort('-createdAt') });
});
export const mine = wrap(async (req, res) => res.json({ courses: await Course.find(req.user.role === 'ADMIN' ? {} : { instructor: req.user._id }).sort('-updatedAt') }));
export const queue = wrap(async (_req, res) => res.json({ courses: await Course.find({ status: { $in: ['SUBMITTED', 'IN_REVIEW'] } }).populate('instructor', 'name') }));
export const get = wrap(async (req, res) => {
  const u = req.user, c = await Course.findById(req.params.id).populate('instructor', 'name avatar');
  const staff = u && (['REVIEWER', 'ADMIN'].includes(u.role) || same(c?.instructor?._id, u._id));
  if (!c || (c.status !== 'PUBLISHED' && !staff)) throw err(404, 'Course not found');
  const en = u ? await Enrollment.findOne({ user: u._id, course: c._id }) : null, full = staff || en;
  const modules = await Module.find({ course: c._id }).sort('order').lean();
  const lessons = await Lesson.find({ course: c._id }).sort('order').lean();
  modules.forEach((m) => { m.lessons = lessons.filter((l) => same(l.module, m._id)).map((l) => (full || l.isPreview ? l : { _id: l._id, title: l.title, duration: l.duration, locked: true })); });
  res.json({ course: c, modules, enrolled: !!en, completed: en ? en.completedLessons : [], completedAt: en?.completedAt });
});
export const create = wrap(async (req, res) => {
  const d = pick(req.body, FIELDS); if (!d.title?.trim() || !d.description?.trim()) throw err(400, 'Title and description are required');
  const c = await Course.create({ ...d, instructor: req.user._id, status: 'DRAFT', slug: d.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36) });
  await audit(req.user, 'COURSE_CREATED', 'Course', c._id);
  res.status(201).json({ course: c });
});
export const update = wrap(async (req, res) => {
  const c = await owned(req.params.id, req.user);
  if (!['DRAFT', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED'].includes(c.status)) throw err(409, 'This course cannot be edited in its current status');
  const wasLive = ['APPROVED', 'PUBLISHED'].includes(c.status); Object.assign(c, pick(req.body, FIELDS)); if (wasLive) c.status = 'DRAFT'; await c.save(); await audit(req.user, 'COURSE_UPDATED', 'Course', c._id, { returnedToDraft: wasLive }); res.json({ course: c, message: wasLive ? 'Course changes saved as a draft and require review.' : undefined });
});
export const submit = wrap(async (req, res) => {
  const c = await owned(req.params.id, req.user);
  if (!['DRAFT', 'CHANGES_REQUESTED'].includes(c.status)) throw err(409, 'Only drafts or courses with requested changes can be submitted');
  if (!(await Lesson.exists({ course: c._id }))) throw err(400, 'Add at least one lesson before submitting');
  c.status = 'SUBMITTED'; await c.save(); res.json({ course: c });
  await audit(req.user, 'COURSE_SUBMITTED', 'Course', c._id);
});
export const review = wrap(async (req, res) => {
  const { decision, comment } = req.body, c = await Course.findById(req.params.id);
  if (!['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'].includes(decision)) throw err(400, 'Invalid decision');
  if (!c) throw err(404, 'Course not found');
  if (!['SUBMITTED', 'IN_REVIEW'].includes(c.status)) throw err(409, 'This course is not awaiting review');
  if (same(c.instructor, req.user._id)) throw err(403, 'You cannot review your own course');
  if (decision !== 'APPROVED' && !comment?.trim()) throw err(400, 'A comment is required');
  await CourseReview.create({ course: c._id, reviewer: req.user._id, decision, comment }); c.status = decision; await c.save(); await audit(req.user, `COURSE_${decision}`, 'Course', c._id);
  const T = { APPROVED: ['approved', 'COURSE_APPROVED'], REJECTED: ['rejected', 'COURSE_REJECTED'], CHANGES_REQUESTED: ['returned with requested changes', 'CHANGES_REQUESTED'] }[decision];
  await notify(c.instructor, T[1], `Your course "${c.title}" was ${T[0]}.${comment ? ' Reviewer: ' + comment : ''}`, '/manage');
  res.json({ course: c });
});
export const publish = wrap(async (req, res) => {
  const c = await owned(req.params.id, req.user);
  if (c.status !== 'APPROVED') throw err(409, 'Only approved courses can be published');
  c.status = 'PUBLISHED'; await c.save(); await audit(req.user, 'COURSE_PUBLISHED', 'Course', c._id); res.json({ course: c });
});
export const addModule = wrap(async (req, res) => {
  const c = await owned(req.params.id, req.user); if (!req.body.title?.trim()) throw err(400, 'Module title is required');
  res.status(201).json({ module: await Module.create({ title: req.body.title, description: req.body.description, course: c._id, order: await Module.countDocuments({ course: c._id }) }) });
});
export const deleteModule = wrap(async (req, res) => {
  const m = await Module.findById(req.params.id); if (!m) throw err(404, 'Module not found'); await owned(m.course, req.user);
  await Lesson.deleteMany({ module: m._id }); await m.deleteOne(); res.json({ message: 'Module deleted' });
});
export const updateModule = wrap(async (req, res) => {
  const m = await Module.findById(req.params.id); if (!m) throw err(404, 'Module not found'); await owned(m.course, req.user);
  if (!req.body.title?.trim()) throw err(400, 'Module title is required');
  m.title = req.body.title; if (req.body.description !== undefined) m.description = req.body.description; await m.save(); res.json({ module: m });
});
export const reorderModules = wrap(async (req, res) => {
  const c = await owned(req.params.id, req.user);
  await Promise.all((req.body.ids || []).map((id, i) => Module.updateOne({ _id: id, course: c._id }, { order: i }))); res.json({ message: 'Reordered' });
});
export const reorderLessons = wrap(async (req, res) => {
  const m = await Module.findById(req.params.id); if (!m) throw err(404, 'Module not found'); await owned(m.course, req.user);
  const ids = req.body.ids; if (!Array.isArray(ids)) throw err(400, 'Lesson ids are required'); await Promise.all(ids.map((id, i) => Lesson.updateOne({ _id: id, module: m._id }, { order: i }))); res.json({ message: 'Lessons reordered' });
});
export const addLesson = wrap(async (req, res) => {
  const m = await Module.findById(req.params.id); if (!m) throw err(404, 'Module not found'); await owned(m.course, req.user);
  if (!req.body.title?.trim()) throw err(400, 'Lesson title is required');
  const d = pick(req.body, ['title', 'description', 'content', 'videoUrl', 'resources', 'duration', 'isPreview']);
  res.status(201).json({ lesson: await Lesson.create({ ...d, module: m._id, course: m.course, order: await Lesson.countDocuments({ module: m._id }) }) });
});
export const deleteLesson = wrap(async (req, res) => {
  const l = await Lesson.findById(req.params.id); if (!l) throw err(404, 'Lesson not found'); await owned(l.course, req.user); await l.deleteOne(); res.json({ message: 'Lesson deleted' });
});
export const updateLesson = wrap(async (req, res) => {
  const l = await Lesson.findById(req.params.id); if (!l) throw err(404, 'Lesson not found'); await owned(l.course, req.user);
  if (!req.body.title?.trim()) throw err(400, 'Lesson title is required');
  Object.assign(l, pick(req.body, ['title', 'description', 'content', 'videoUrl', 'resources', 'duration', 'isPreview'])); await l.save(); res.json({ lesson: l });
});
export const enroll = wrap(async (req, res) => {
  const c = await Course.findOne({ _id: req.params.id, status: 'PUBLISHED' }); if (!c) throw err(404, 'Course not available');
  const enrollmentFilter = { user: req.user._id, course: c._id };
  const existing = await Enrollment.findOne(enrollmentFilter);
  if (existing) return res.json({ enrollment: existing, alreadyEnrolled: true });
  let enrollment;
  try {
    enrollment = await Enrollment.create(enrollmentFilter);
  } catch (error) {
    if (error.code !== 11000) throw error;
    enrollment = await Enrollment.findOne(enrollmentFilter);
    if (!enrollment) throw error;
    return res.json({ enrollment, alreadyEnrolled: true });
  }
  await notify(req.user._id, 'ENROLLMENT', `You enrolled in "${c.title}".`, `/learn/${c._id}`);
  res.status(201).json({ enrollment });
});
export const myEnrollments = wrap(async (req, res) => res.json({ enrollments: await progressFor(req.user._id) }));
export const completeLesson = wrap(async (req, res) => {
  const l = await Lesson.findById(req.params.id); if (!l) throw err(404, 'Lesson not found');
  const e = await Enrollment.findOne({ user: req.user._id, course: l.course }); if (!e) throw err(403, 'Enroll in this course first');
  await Enrollment.updateOne({ _id: e._id }, req.body.completed === false ? { $pull: { completedLessons: l._id } } : { $addToSet: { completedLessons: l._id } });
  await checkCompletion(req.user._id, l.course);
  res.json({ message: 'Progress saved' });
});

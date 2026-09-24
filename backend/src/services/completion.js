import crypto from 'crypto';
import User from '../models/User.js';
import { Course } from '../models/Course.js';
import Certificate from '../models/Certificate.js';
import { requirements } from './progress.js';
import { notify } from './notify.js';
import { Assignment, AssignmentSubmission } from '../models/Assignment.js';
import { audit } from './audit.js';
// Called after any activity. Completes the enrollment and issues ONE certificate when every required lesson and quiz is done.
export async function checkCompletion(userId, courseId) {
  const r = await requirements(userId, courseId), requiredAssignments = await Assignment.find({ course: courseId, requiredForCompletion: true }).select('_id'), graded = requiredAssignments.length ? await AssignmentSubmission.countDocuments({ student: userId, assignment: { $in: requiredAssignments.map(a => a._id) }, status: 'GRADED' }) : 0, total = r.lessons.length + r.quizzes.length + requiredAssignments.length;
  if (!r.en || r.en.completedAt || !total || r.doneLessons + r.passedQuizzes + graded < total) return null;
  const [user, course] = await Promise.all([User.findById(userId), Course.findById(courseId).populate('instructor', 'name')]);
  let cert;
  try {
    cert = await Certificate.create({ certificateId: `LH-${new Date().getFullYear()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`, user: userId, course: courseId, studentName: user.name, courseTitle: course.title, instructorName: course.instructor?.name, completedAt: new Date() });
  } catch (e) { if (e.code === 11000) return null; throw e; }
  r.en.completedAt = cert.completedAt; await r.en.save();
  await notify(userId, 'COURSE', `You completed "${course.title}". Congratulations!`, '/');
  await notify(userId, 'CERTIFICATE', `Your certificate for "${course.title}" is ready.`, '/certificates');
  await audit(userId, 'CERTIFICATE_ISSUED', 'Certificate', cert._id, { courseId: String(courseId) });
  return cert;
}

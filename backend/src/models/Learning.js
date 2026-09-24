import mongoose from 'mongoose';
const { Schema } = mongoose, ref = (m) => ({ type: Schema.Types.ObjectId, ref: m, required: true });
const en = new Schema({ user: ref('User'), course: ref('Course'), completedLessons: [{ type: Schema.Types.ObjectId, ref: 'Lesson' }], completedAt: Date }, { timestamps: true });
en.index({ user: 1, course: 1 }, { unique: true });
export const Enrollment = mongoose.model('Enrollment', en);
export const CourseReview = mongoose.model('CourseReview', new Schema({
  course: ref('Course'), reviewer: ref('User'), comment: String,
  decision: { type: String, enum: ['APPROVED', 'CHANGES_REQUESTED', 'REJECTED'], required: true },
}, { timestamps: true }));

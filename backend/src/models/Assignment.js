import mongoose from 'mongoose';
const { Schema } = mongoose;
const ref = (model) => ({ type: Schema.Types.ObjectId, ref: model, required: true });
export const Assignment = mongoose.model('Assignment', new Schema({
  title: { type: String, required: true, trim: true, maxlength: 160 },
  description: { type: String, trim: true, maxlength: 2000 }, instructions: { type: String, trim: true, maxlength: 8000 },
  course: ref('Course'), module: { type: Schema.Types.ObjectId, ref: 'Module' }, lesson: { type: Schema.Types.ObjectId, ref: 'Lesson' },
  dueDate: { type: Date, required: true }, maximumMarks: { type: Number, required: true, min: 1, max: 10000 },
  allowText: { type: Boolean, default: true }, allowFile: { type: Boolean, default: false }, requiredForCompletion: { type: Boolean, default: false },
  createdBy: ref('User'),
}, { timestamps: true }));
export const AssignmentSubmission = mongoose.model('AssignmentSubmission', new Schema({
  student: ref('User'), assignment: ref('Assignment'), content: { type: String, trim: true, maxlength: 20000 }, fileUrl: String,
  submittedAt: Date, status: { type: String, enum: ['DRAFT', 'SUBMITTED', 'GRADED'], default: 'DRAFT' },
  marks: { type: Number, min: 0 }, feedback: { type: String, trim: true, maxlength: 5000 }, gradedBy: { type: Schema.Types.ObjectId, ref: 'User' }, gradedAt: Date,
}, { timestamps: true }));
AssignmentSubmission.schema.index({ student: 1, assignment: 1 }, { unique: true });

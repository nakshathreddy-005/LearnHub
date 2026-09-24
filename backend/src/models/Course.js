import mongoose from 'mongoose';
const { Schema } = mongoose, ref = (m) => ({ type: Schema.Types.ObjectId, ref: m, required: true });
export const STATUSES = ['DRAFT', 'SUBMITTED', 'IN_REVIEW', 'CHANGES_REQUESTED', 'APPROVED', 'PUBLISHED', 'REJECTED', 'ARCHIVED'];
export const Course = mongoose.model('Course', new Schema({
  title: { type: String, required: true, trim: true }, slug: { type: String, unique: true },
  description: { type: String, required: true }, shortDescription: String, thumbnail: String,
  category: { type: String, default: 'General' }, instructor: ref('User'),
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  duration: String, tags: [String], learningObjectives: [String], prerequisites: [String],
  status: { type: String, enum: STATUSES, default: 'DRAFT' },
}, { timestamps: true }));
export const Module = mongoose.model('Module', new Schema({ title: { type: String, required: true }, description: String, course: ref('Course'), order: { type: Number, default: 0 } }));
export const Lesson = mongoose.model('Lesson', new Schema({
  title: { type: String, required: true }, description: String, content: String, videoUrl: String, resources: [String],
  duration: Number, order: { type: Number, default: 0 }, isPreview: { type: Boolean, default: false }, module: ref('Module'), course: ref('Course'),
}, { timestamps: true }));

import mongoose from 'mongoose';
const { Schema } = mongoose, ref = (m) => ({ type: Schema.Types.ObjectId, ref: m, required: true });
export const Quiz = mongoose.model('Quiz', new Schema({
  course: ref('Course'), title: { type: String, required: true, trim: true }, description: String,
  timeLimitMin: { type: Number, default: 0 }, maxAttempts: { type: Number, default: 3 }, passPercent: { type: Number, default: 70 },
  questionCount: { type: Number, default: 0 }, isRequired: { type: Boolean, default: true },
}, { timestamps: true }));
export const Question = mongoose.model('Question', new Schema({
  quiz: ref('Quiz'), text: { type: String, required: true }, options: [String], correctIndex: { type: Number, required: true },
  explanation: String, concept: { type: String, default: 'General' }, difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
}, { timestamps: true }));
export const QuizAttempt = mongoose.model('QuizAttempt', new Schema({
  user: ref('User'), quiz: ref('Quiz'), course: ref('Course'), questionIds: [{ type: Schema.Types.ObjectId, ref: 'Question' }],
  answers: [{ question: Schema.Types.ObjectId, concept: String, selected: { type: Number, default: null }, correct: Boolean }],
  attemptNumber: Number, score: Number, total: Number, percentage: Number, passed: { type: Boolean, default: false },
  concepts: [String], weakConcepts: [String], status: { type: String, enum: ['IN_PROGRESS', 'SUBMITTED'], default: 'IN_PROGRESS' },
  startedAt: Date, expiresAt: Date, submittedAt: Date,
}, { timestamps: true }));

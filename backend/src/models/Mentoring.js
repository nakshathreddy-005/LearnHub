import mongoose from 'mongoose';
const { Schema } = mongoose;
const ref = (model) => ({ type: Schema.Types.ObjectId, ref: model, required: true });
export const MentorAssignment = mongoose.model('MentorAssignment', new Schema({ mentor: ref('User'), student: ref('User') }, { timestamps: true }));
MentorAssignment.schema.index({ mentor: 1, student: 1 }, { unique: true });
export const MentoringSession = mongoose.model('MentoringSession', new Schema({
  mentor: ref('User'), student: ref('User'), scheduledFor: { type: Date, required: true }, topic: { type: String, required: true, trim: true, maxlength: 160 },
  notes: { type: String, trim: true, maxlength: 5000 }, meetingLink: String,
  status: { type: String, enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
}, { timestamps: true }));
export const MentoringNote = mongoose.model('MentoringNote', new Schema({ mentor: ref('User'), student: ref('User'), note: { type: String, required: true, maxlength: 5000 } }, { timestamps: true }));

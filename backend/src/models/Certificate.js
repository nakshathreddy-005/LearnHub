import mongoose from 'mongoose';
const { Schema } = mongoose;
const s = new Schema({
  certificateId: { type: String, unique: true, required: true }, user: { type: Schema.Types.ObjectId, ref: 'User', required: true }, course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  studentName: String, courseTitle: String, instructorName: String, completedAt: Date,
}, { timestamps: true });
s.index({ user: 1, course: 1 }, { unique: true }); // prevents duplicate certificates
export default mongoose.model('Certificate', s);

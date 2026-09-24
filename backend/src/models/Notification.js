import mongoose from 'mongoose';
export default mongoose.model('Notification', new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true }, type: String, message: { type: String, required: true }, link: String, read: { type: Boolean, default: false },
}, { timestamps: true }));

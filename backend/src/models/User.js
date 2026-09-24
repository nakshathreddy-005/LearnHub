import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
export const ROLES = ['ADMIN', 'INSTRUCTOR', 'REVIEWER', 'STUDENT', 'MENTOR'];
const s = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6, select: false },
  role: { type: String, enum: ROLES, default: 'STUDENT' },
  avatar: String, bio: { type: String, maxlength: 500 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
s.pre('save', async function (next) { if (this.isModified('password')) this.password = await bcrypt.hash(this.password, 10); next(); });
s.methods.matches = function (p) { return bcrypt.compare(p, this.password); };
s.set('toJSON', { transform: (_d, r) => { delete r.password; delete r.__v; return r; } });
export default mongoose.model('User', s);

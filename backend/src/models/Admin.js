import mongoose from 'mongoose';
const { Schema } = mongoose;
export const Category = mongoose.model('Category', new Schema({ name: { type: String, required: true, unique: true, trim: true, maxlength: 80 }, description: { type: String, trim: true, maxlength: 500 }, status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' } }, { timestamps: true }));
export const AuditLog = mongoose.model('AuditLog', new Schema({ user: { type: Schema.Types.ObjectId, ref: 'User' }, action: { type: String, required: true }, entityType: String, entityId: String, metadata: Schema.Types.Mixed }, { timestamps: true }));

import { AuditLog } from '../models/Admin.js';
export const audit = (user, action, entityType, entityId, metadata = {}) => AuditLog.create({ user: user?._id || user, action, entityType, entityId: entityId && String(entityId), metadata }).catch(() => {});

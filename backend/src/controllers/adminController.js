import User, { ROLES } from '../models/User.js';
import { err, wrap } from '../utils/http.js';
import { audit } from '../services/audit.js';
export const users = wrap(async (req, res) => {
  const q = {}; if (ROLES.includes(req.query.role)) q.role = req.query.role;
  if (req.query.q) q.$or = ['name', 'email'].map((k) => ({ [k]: new RegExp(String(req.query.q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }));
  res.json({ users: await User.find(q).sort('-createdAt') });
});
export const setRole = wrap(async (req, res) => {
  if (!ROLES.includes(req.body.role)) throw err(400, 'Invalid role');
  if (String(req.params.id) === String(req.user._id)) throw err(400, 'You cannot change your own role');
  const u = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }); if (!u) throw err(404, 'User not found'); await audit(req.user, 'ROLE_CHANGED', 'User', u._id, { role: u.role }); res.json({ user: u });
});
export const setActive = wrap(async (req, res) => {
  if (String(req.params.id) === String(req.user._id)) throw err(400, 'You cannot deactivate yourself');
  const u = await User.findByIdAndUpdate(req.params.id, { isActive: !!req.body.isActive }, { new: true }); if (!u) throw err(404, 'User not found'); await audit(req.user, 'USER_STATUS_CHANGED', 'User', u._id, { isActive: u.isActive }); res.json({ user: u });
});

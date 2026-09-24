import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { err, wrap } from '../utils/http.js';
const load = async (req) => {
  const t = req.cookies?.token; if (!t) return null;
  try { const u = await User.findById(jwt.verify(t, process.env.JWT_SECRET).id); return u?.isActive ? u : null; } catch { return null; }
};
export const protect = wrap(async (req, _res, next) => { req.user = await load(req); if (!req.user) throw err(401, 'Please sign in'); next(); });
export const optionalAuth = wrap(async (req, _res, next) => { req.user = await load(req); next(); });
export const authorize = (...roles) => (req, _res, next) => roles.includes(req.user.role) ? next() : next(err(403, 'You do not have permission to do that'));

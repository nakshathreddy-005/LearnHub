import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { err, wrap } from '../utils/http.js';
import { audit } from '../services/audit.js';
const cookieOptions = { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' };
const cookie = { ...cookieOptions, maxAge: 7 * 864e5 };
const sign = (res, u) => res.cookie('token', jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }), cookie);
export const register = wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !/^\S+@\S+\.\S+$/.test(email || '') || (password || '').length < 6) throw err(400, 'Enter a name, a valid email and a password of 6+ characters');
  if (await User.findOne({ email: email.toLowerCase() })) throw err(409, 'That email is already registered');
  const u = await User.create({ name, email, password }); // role is never read from the request: defaults to STUDENT
  sign(res, u); await audit(u, 'REGISTERED', 'User', u._id); res.status(201).json({ user: u });
});
export const login = wrap(async (req, res) => {
  const u = await User.findOne({ email: String(req.body.email || '').toLowerCase() }).select('+password');
  if (!u || !(await u.matches(req.body.password || ''))) throw err(401, 'Incorrect email or password');
  if (!u.isActive) throw err(403, 'This account is deactivated');
  sign(res, u); await audit(u, 'LOGIN', 'User', u._id); res.json({ user: u });
});
export const logout = (req, res) => { res.clearCookie('token', cookieOptions); audit(req.user, 'LOGOUT', 'User', req.user?._id); res.json({ message: 'Signed out' }); };
export const me = (req, res) => res.json({ user: req.user });

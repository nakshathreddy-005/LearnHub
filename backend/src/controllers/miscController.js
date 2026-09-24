import Notification from '../models/Notification.js';
import Certificate from '../models/Certificate.js';
import { wrap } from '../utils/http.js';
export const listNotes = wrap(async (req, res) => res.json({ notifications: await Notification.find({ user: req.user._id }).sort('-createdAt').limit(50), unread: await Notification.countDocuments({ user: req.user._id, read: false }) }));
export const readNote = wrap(async (req, res) => { await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true }); res.json({ ok: true }); });
export const readAll = wrap(async (req, res) => { await Notification.updateMany({ user: req.user._id, read: false }, { read: true }); res.json({ ok: true }); });
export const myCerts = wrap(async (req, res) => res.json({ certificates: await Certificate.find({ user: req.user._id }).sort('-completedAt') }));
export const verify = wrap(async (req, res) => {
  const c = await Certificate.findOne({ certificateId: String(req.params.certificateId).toUpperCase() }).select('certificateId studentName courseTitle instructorName completedAt');
  c ? res.json({ verified: true, certificate: c }) : res.status(404).json({ verified: false, message: 'No certificate matches this ID' });
});

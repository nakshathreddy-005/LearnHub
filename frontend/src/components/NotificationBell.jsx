import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from '../services/api';
export default function NotificationBell() {
  const [d, setD] = useState({ notifications: [], unread: 0 }), [open, setOpen] = useState(false), nav = useNavigate();
  const load = () => api.get('/notifications').then((r) => setD(r.data)).catch(() => {});
  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);
  const go = async (n) => { await api.patch(`/notifications/${n._id}/read`); setOpen(false); load(); if (n.link) nav(n.link); };
  return (
    <div className="relative">
      <button className="btn relative" aria-label={`Notifications, ${d.unread} unread`} onClick={() => { setOpen(!open); load(); }}><Bell size={16} />{d.unread > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-red-600 px-1.5 text-xs text-white">{d.unread}</span>}</button>
      {open && <div className="absolute right-0 z-30 mt-2 w-80 max-w-[85vw] rounded-xl border bg-white p-2 shadow-lg">
        <div className="flex items-center justify-between px-2 py-1 text-sm font-bold">Notifications<button className="text-xs font-normal text-brand-600" onClick={async () => { await api.patch('/notifications/read-all'); load(); }}>Mark all read</button></div>
        {!d.notifications.length && <p className="p-3 text-sm text-slate-500">You are all caught up.</p>}
        {d.notifications.slice(0, 6).map((n) => <button key={n._id} onClick={() => go(n)} className={`block w-full rounded px-2 py-2 text-left text-sm hover:bg-slate-50 ${n.read ? 'text-slate-500' : 'font-semibold'}`}>{n.message}</button>)}
        <Link to="/notifications" onClick={() => setOpen(false)} className="block px-2 py-1 text-sm text-brand-600">View all</Link></div>}
    </div>
  );
}

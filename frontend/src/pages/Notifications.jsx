import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
export default function Notifications() {
  const [d, setD] = useState(null), load = () => api.get('/notifications').then((r) => setD(r.data));
  useEffect(() => { load(); }, []);
  if (!d) return <p>Loading…</p>;
  return (
    <div className="space-y-3"><div className="flex items-center justify-between"><h1 className="text-2xl font-bold">Notifications <span className="text-sm font-normal text-slate-500">({d.unread} unread)</span></h1><button className="btn" onClick={async () => { await api.patch('/notifications/read-all'); load(); }}>Mark all as read</button></div>
      {!d.notifications.length && <div className="card">You are all caught up.</div>}
      {d.notifications.map((n) => <div key={n._id} className={`card flex items-center justify-between gap-3 ${n.read ? '' : 'border-l-4 border-l-brand-600'}`}><div><div className={n.read ? 'text-slate-600' : 'font-semibold'}>{n.message}</div><div className="text-xs text-slate-500">{n.type} · {new Date(n.createdAt).toLocaleString()}</div></div>
        <div className="flex gap-2">{n.link && <Link className="btn" to={n.link}>Open</Link>}{!n.read && <button className="btn" onClick={async () => { await api.patch(`/notifications/${n._id}/read`); load(); }}>Mark read</button>}</div></div>)}</div>
  );
}

import { useEffect, useState } from 'react';
import api, { msg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';
const ROLES = ['STUDENT', 'INSTRUCTOR', 'REVIEWER', 'MENTOR', 'ADMIN'];
export default function Users() {
  const { user: me } = useAuth(), [list, setList] = useState(null), [q, setQ] = useState(''), [role, setRole] = useState('');
  const load = () => api.get('/admin/users', { params: { q, role } }).then((r) => setList(r.data.users));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q, role]);
  const act = async (fn, ok) => { try { await fn(); toast(ok); load(); } catch (e) { toast(msg(e)); } };
  return (
    <div className="space-y-3"><h1 className="text-2xl font-bold">Users</h1>
      <div className="flex flex-wrap gap-2"><input className="input max-w-xs" placeholder="Search name or email" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input w-auto" value={role} onChange={(e) => setRole(e.target.value)}><option value="">All roles</option>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
      <div className="card overflow-x-auto p-0"><table className="w-full text-sm"><thead><tr className="border-b text-left text-slate-500"><th className="p-3">User</th><th>Role</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>{list?.map((u) => <tr key={u._id} className="border-b"><td className="p-3">{u.name}<br /><span className="text-xs text-slate-500">{u.email}</span></td>
          <td><select className="input w-auto" value={u.role} disabled={u._id === me._id} onChange={(e) => act(() => api.patch(`/admin/users/${u._id}/role`, { role: e.target.value }), 'Role updated')}>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></td>
          <td>{u.isActive ? 'Active' : 'Inactive'}</td><td><button className="btn" disabled={u._id === me._id} onClick={() => act(() => api.patch(`/admin/users/${u._id}/active`, { isActive: !u.isActive }), 'User updated')}>{u.isActive ? 'Deactivate' : 'Activate'}</button></td></tr>)}</tbody></table></div></div>
  );
}

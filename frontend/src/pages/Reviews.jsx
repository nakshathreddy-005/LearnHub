import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { msg } from '../services/api';
import { toast } from '../utils/toast';
export default function Reviews() {
  const [list, setList] = useState(null), [cm, setCm] = useState({});
  const load = () => api.get('/courses/review-queue').then((r) => setList(r.data.courses));
  useEffect(() => { load(); }, []);
  async function decide(id, decision) { try { await api.post(`/courses/${id}/review`, { decision, comment: cm[id] }); toast('Decision recorded'); load(); } catch (e) { toast(msg(e)); } }
  return (
    <div className="space-y-3"><h1 className="text-2xl font-bold">Course reviews</h1>
      {!list ? <p>Loading…</p> : !list.length ? <div className="card">No courses are waiting for review.</div> : list.map((c) => (
        <div key={c._id} className="card"><h3 className="font-semibold">{c.title}</h3><p className="text-sm text-slate-600">By {c.instructor?.name} · {c.level}</p>
          <Link className="text-sm text-brand-600 underline" to={`/learn/${c._id}`}>Inspect content</Link>
          <textarea className="input my-2" placeholder="Comments for the instructor (required unless approving)" value={cm[c._id] || ''} onChange={(e) => setCm({ ...cm, [c._id]: e.target.value })} />
          <div className="flex flex-wrap gap-2"><button className="btn btn-p" onClick={() => decide(c._id, 'APPROVED')}>Approve</button><button className="btn" onClick={() => decide(c._id, 'CHANGES_REQUESTED')}>Request changes</button><button className="btn" onClick={() => decide(c._id, 'REJECTED')}>Reject</button></div></div>))}</div>
  );
}

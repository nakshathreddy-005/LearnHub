import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api, { msg } from '../services/api';
export default function Quiz() {
  const { id } = useParams(), nav = useNavigate(), [d, setD] = useState(null), [err, setErr] = useState(''), [i, setI] = useState(0), [ans, setAns] = useState({}), [left, setLeft] = useState(null), [busy, setBusy] = useState(false), sent = useRef(false);
  useEffect(() => { api.post(`/quizzes/${id}/start`).then((r) => setD(r.data)).catch((e) => setErr(msg(e))); }, [id]);
  async function submit(auto) {
    if (sent.current) return;
    const un = d.questions.filter((q) => ans[q._id] === undefined).length;
    if (!auto && un && !confirm(`${un} question(s) unanswered. Submit anyway?`)) return;
    sent.current = true; setBusy(true);
    try { const r = await api.post(`/attempts/${d.attempt._id}/submit`, { answers: Object.entries(ans).map(([question, selected]) => ({ question, selected })) }); nav(`/results/${r.data.attempt._id}`, { replace: true }); }
    catch (e) { sent.current = false; setBusy(false); setErr(msg(e)); }
  }
  useEffect(() => {
    if (!d?.attempt.expiresAt) return;
    const tick = () => { const s = Math.ceil((new Date(d.attempt.expiresAt) - Date.now()) / 1000); setLeft(Math.max(0, s)); if (s <= 0) submit(true); };
    tick(); const t = setInterval(tick, 1000); return () => clearInterval(t);
  }, [d]);
  if (err) return <div className="card"><p className="text-red-700">{err}</p><Link className="btn mt-2" to="/">Back to dashboard</Link></div>;
  if (!d) return <p>Starting quiz…</p>;
  const q = d.questions[i], mm = left != null ? `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}` : null;
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="flex items-center justify-between"><h1 className="text-xl font-bold">{d.quiz.title}</h1>{mm && <span className={`rounded-lg px-3 py-1 text-sm font-bold ${left < 60 ? 'bg-red-100 text-red-800' : 'bg-slate-100'}`} role="timer">⏱ {mm}</span>}</div>
      <div className="h-2 rounded bg-slate-200"><div className="h-2 rounded bg-brand-600" style={{ width: `${((i + 1) / d.questions.length) * 100}%` }} /></div>
      <div className="card"><p className="text-sm text-slate-500">Question {i + 1} of {d.questions.length} · {q.difficulty}</p><h2 className="my-2 font-semibold">{q.text}</h2>
        {q.options.map((o, k) => <button key={k} onClick={() => setAns({ ...ans, [q._id]: k })} className={`my-1 block w-full rounded-lg border px-3 py-2 text-left text-sm ${ans[q._id] === k ? 'border-brand-600 bg-brand-50' : 'border-slate-300 hover:border-brand-600'}`}>{o}</button>)}</div>
      <div className="flex flex-wrap gap-1">{d.questions.map((x, k) => <button key={x._id} onClick={() => setI(k)} aria-label={`Question ${k + 1}`} className={`h-8 w-8 rounded text-sm font-semibold ${k === i ? 'bg-brand-600 text-white' : ans[x._id] !== undefined ? 'bg-brand-50 text-brand-700' : 'bg-slate-100'}`}>{k + 1}</button>)}</div>
      <div className="flex gap-2"><button className="btn" disabled={!i} onClick={() => setI(i - 1)}>Previous</button>{i < d.questions.length - 1 ? <button className="btn btn-p" onClick={() => setI(i + 1)}>Next</button> : null}<button className="btn btn-p ml-auto" disabled={busy} onClick={() => submit(false)}>{busy ? 'Submitting…' : 'Submit quiz'}</button></div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { msg } from '../services/api';
const PR = { High: 'bg-red-100 text-red-800', Medium: 'bg-amber-100 text-amber-800', Low: 'bg-slate-100 text-slate-700' };
export default function AiPath() {
  const [d, setD] = useState(null), [e, setE] = useState(''), [busy, setBusy] = useState(false), [goal, setGoal] = useState('Become a Full Stack Developer');
  const load = () => { setBusy(true); setE(''); api.get('/ai/learning-path', { params: { goal } }).then((r) => setD(r.data)).catch((x) => setE(msg(x))).finally(() => setBusy(false)); };
  useEffect(load, []);
  const L = ({ t, items, none }) => <div className="card"><h3 className="font-semibold">{t}</h3>{items.length ? <ul className="list-disc pl-5 text-sm">{items.map((i) => <li key={i}>{i}</li>)}</ul> : <p className="text-sm text-slate-500">{none}</p>}</div>;
  return (
    <div className="space-y-3"><h1 className="text-2xl font-bold">Your AI learning path</h1>
      <div className="flex flex-wrap gap-2"><input className="input max-w-sm" aria-label="Learning goal" value={goal} onChange={(x) => setGoal(x.target.value)} maxLength={100} /><button className="btn btn-p" onClick={load} disabled={busy}>{busy ? 'Analyzing…' : 'Regenerate path'}</button></div>
      {e && <div className="card text-red-700">{e}</div>}
      {d && <><p className="text-sm text-slate-500">Personalized from your quiz answers, concepts, lesson and course progress{d.goal ? ` · Goal: ${d.goal}` : ''}</p>
        <div className="grid gap-3 sm:grid-cols-2"><L t="Strengths" items={d.strengths} none="Take quizzes to reveal your strengths." /><L t="Weaknesses" items={d.weaknesses} none="No weak concepts detected." /></div>
        {d.revisions.length > 0 && <div className="card"><h3 className="font-semibold">Recommended revision</h3>{d.revisions.map((r) => <p key={r.concept} className="text-sm">{r.concept} ({r.pct}%) → {r.lesson ? <Link className="text-brand-600 underline" to={`/learn/${r.courseId}`}>{r.lesson} in {r.courseTitle}</Link> : 'revisit your notes'}</p>)}</div>}
        {d.path.map((s, i) => <div key={i} className="card"><div className="flex flex-wrap items-center justify-between gap-2"><b>Step {i + 1}: {s.step}</b><span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${PR[s.priority]}`}>{s.priority} priority</span></div>
          <p className="text-sm text-slate-600">{s.reason}</p><p className="text-sm">Activity: {s.activity} · Effort: {s.effort}</p>{s.link && <Link className="btn btn-p mt-2" to={s.link}>Start</Link>}</div>)}</>}
    </div>
  );
}

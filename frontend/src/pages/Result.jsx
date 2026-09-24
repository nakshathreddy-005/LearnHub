import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, XCircle } from 'lucide-react';
import api, { msg } from '../services/api';
export default function Result() {
  const { id } = useParams(), [d, setD] = useState(null), [err, setErr] = useState('');
  useEffect(() => { api.get(id ? `/attempts/${id}` : '/attempts/me').then((r) => setD(r.data)).catch((e) => setErr(msg(e))); }, [id]);
  if (err) return <div className="card text-red-700">{err}</div>;
  if (!d) return <p>Loading…</p>;
  if (!id) return (
    <div className="space-y-3"><h1 className="text-2xl font-bold">Quiz results</h1>{!d.attempts.length && <div className="card">No quiz attempts yet.</div>}
      {d.attempts.map((a) => <Link key={a._id} to={`/results/${a._id}`} className="card flex items-center justify-between hover:border-brand-600"><span><b>{a.quiz?.title}</b> · attempt {a.attemptNumber}<br /><span className="text-xs text-slate-500">{new Date(a.submittedAt).toLocaleString()}{a.weakConcepts?.length ? ' · Weak: ' + a.weakConcepts.join(', ') : ''}</span></span><span className={`font-bold ${a.passed ? 'text-green-700' : 'text-red-700'}`}>{a.percentage}% {a.passed ? 'Passed' : 'Failed'}</span></Link>)}</div>);
  const a = d.attempt;
  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="card"><h1 className="text-xl font-bold">{a.quiz?.title}</h1><p className="text-3xl font-extrabold">{a.score}/{a.total} <span className="text-lg">({a.percentage}%)</span></p>
        <p className={`font-semibold ${a.passed ? 'text-green-700' : 'text-red-700'}`}>{a.passed ? 'Passed' : 'Not passed'} · pass mark {a.quiz?.passPercent}%{d.timedOut ? ' · time ran out' : ''}</p>
        {a.weakConcepts.length > 0 ? <div className="mt-2 rounded-lg bg-amber-50 p-3 text-sm"><b>Weak concepts:</b> {a.weakConcepts.join(', ')}<br />Recommendation: review {a.weakConcepts[0]} fundamentals, then retake the quiz.<div className="mt-2"><Link className="btn btn-p" to="/ai">See my AI learning path</Link></div></div> : <p className="mt-2 text-sm text-green-700">No weak concepts detected. Great work!</p>}</div>
      {d.review.map((r, k) => <div key={k} className="card"><div className="flex items-start gap-2">{r.correct ? <CheckCircle2 className="text-green-700" size={18} /> : <XCircle className="text-red-700" size={18} />}<div><b>{k + 1}. {r.question}</b><div className="text-xs text-slate-500">{r.concept}</div></div></div>
        <p className="mt-2 text-sm">Your answer: {r.selected != null ? r.options[r.selected] : 'No answer'}{!r.correct && <><br />Correct answer: <b>{r.options[r.correctIndex]}</b></>}</p>{r.explanation && <p className="mt-1 text-sm text-slate-600">💡 {r.explanation}</p>}</div>)}
      <Link className="btn" to="/results">All results</Link></div>
  );
}

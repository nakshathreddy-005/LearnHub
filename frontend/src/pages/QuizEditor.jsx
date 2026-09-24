import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { msg, fe } from '../services/api';
import { toast } from '../utils/toast';
const blank = { text: '', options: ['', '', '', ''], correctIndex: 0, concept: '', difficulty: 'MEDIUM', explanation: '' };
const Err = ({ e }) => (e ? <p className="text-xs text-red-700" role="alert">{e}</p> : null);
export default function QuizEditor() {
  const { id } = useParams(), nav = useNavigate(), [d, setD] = useState(null), [s, setS] = useState(null), [q, setQ] = useState(blank), [edit, setEdit] = useState(null), [se, setSe] = useState({}), [qe, setQe] = useState({}), [err, setErr] = useState('');
  const load = () => api.get(`/quizzes/${id}/manage`).then((r) => { setD(r.data); setS((x) => x || r.data.quiz); }).catch((e) => setErr(msg(e)));
  useEffect(() => { load(); }, [id]);
  if (err) return <div className="card text-red-700">{err}</div>;
  if (!d || !s) return <p>Loading…</p>;
  const F = (k, label, type = 'number') => <label className="text-sm font-medium">{label}<input className="input mt-1" type={type} value={s[k] ?? ''} onChange={(e) => setS({ ...s, [k]: e.target.value })} /><Err e={se[k]} /></label>;
  async function saveQuiz(e) { e.preventDefault(); setSe({}); try { await api.put(`/quizzes/${id}`, s); toast('Quiz settings saved'); } catch (x) { setSe(fe(x)); toast(msg(x)); } }
  async function saveQ(e) {
    e.preventDefault(); setQe({});
    try { edit ? await api.put(`/questions/${edit}`, q) : await api.post(`/quizzes/${id}/questions`, q); toast(edit ? 'Question updated' : 'Question added'); setQ(blank); setEdit(null); load(); } catch (x) { setQe(fe(x)); toast(msg(x)); }
  }
  return (
    <div className="space-y-4"><Link to="/manage" className="text-sm text-brand-600">← Back to courses</Link><h1 className="text-2xl font-bold">Edit quiz</h1>
      <form onSubmit={saveQuiz} className="card grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium sm:col-span-2">Title<input className="input mt-1" value={s.title} onChange={(e) => setS({ ...s, title: e.target.value })} /><Err e={se.title} /></label>
        {F('timeLimitMin', 'Time limit (minutes, 0 = none)')}{F('maxAttempts', 'Max attempts (0 = unlimited)')}{F('passPercent', 'Passing percentage')}{F('questionCount', 'Random questions per attempt (0 = all)')}
        <div className="flex gap-2 sm:col-span-2"><button className="btn btn-p">Save settings</button><button type="button" className="btn text-red-700" onClick={async () => { if (confirm('Delete this quiz and all its questions and attempts?')) { await api.delete(`/quizzes/${id}`); toast('Quiz deleted'); nav('/manage'); } }}>Delete quiz</button></div></form>
      <h2 className="text-lg font-bold">Question bank ({d.questions.length})</h2>
      {!d.questions.length && <div className="card">No questions yet. Add the first one below.</div>}
      {d.questions.map((x) => <div key={x._id} className="card text-sm"><div className="flex justify-between gap-2"><b>{x.text}</b><span className="whitespace-nowrap text-xs text-slate-500">{x.concept} · {x.difficulty}</span></div>
        <ol className="ml-5 list-[upper-alpha]">{x.options.map((o, k) => <li key={k} className={k === x.correctIndex ? 'font-semibold text-green-700' : ''}>{o}</li>)}</ol>
        <div className="mt-2 flex gap-2"><button className="btn" onClick={() => { setEdit(x._id); setQ({ ...x, options: [...x.options, '', '', ''].slice(0, Math.max(4, x.options.length)) }); window.scrollTo(0, document.body.scrollHeight); }}>Edit</button><button className="btn text-red-700" onClick={async () => { if (confirm('Delete this question?')) { await api.delete(`/questions/${x._id}`); toast('Question deleted'); load(); } }}>Delete</button></div></div>)}
      <form onSubmit={saveQ} className="card space-y-2"><h3 className="font-bold">{edit ? 'Edit question' : 'Add question'}</h3>
        <textarea className="input" placeholder="Question text" value={q.text} onChange={(e) => setQ({ ...q, text: e.target.value })} /><Err e={qe.text} />
        {q.options.map((o, k) => <div key={k} className="flex items-center gap-2"><input type="radio" name="c" aria-label={`Option ${k + 1} is correct`} checked={q.correctIndex === k} onChange={() => setQ({ ...q, correctIndex: k })} /><input className="input" placeholder={`Option ${k + 1}`} value={o} onChange={(e) => setQ({ ...q, options: q.options.map((z, j) => (j === k ? e.target.value : z)) })} /></div>)}
        <Err e={qe.options || qe.correctIndex} />
        <div className="grid gap-2 sm:grid-cols-2"><input className="input" placeholder="Concept (e.g. Promises)" value={q.concept} onChange={(e) => setQ({ ...q, concept: e.target.value })} /><select className="input" value={q.difficulty} onChange={(e) => setQ({ ...q, difficulty: e.target.value })}><option>EASY</option><option>MEDIUM</option><option>HARD</option></select></div>
        <textarea className="input" placeholder="Explanation shown after submission" value={q.explanation || ''} onChange={(e) => setQ({ ...q, explanation: e.target.value })} />
        <div className="flex gap-2"><button className="btn btn-p">{edit ? 'Update question' : 'Add question'}</button>{edit && <button type="button" className="btn" onClick={() => { setEdit(null); setQ(blank); }}>Cancel</button>}</div></form></div>
  );
}

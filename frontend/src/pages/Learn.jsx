import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Circle, Lock } from 'lucide-react';
import api, { msg } from '../services/api';
import { toast } from '../utils/toast';
import Assignments from './Assignments';
export default function Learn() {
  const { id } = useParams(), [d, setD] = useState(null), [qz, setQz] = useState([]), [err, setErr] = useState(''), [sel, setSel] = useState(null);
  const load = () => api.get(`/courses/${id}`).then((r) => { setD(r.data); setSel((s) => s || r.data.modules[0]?.lessons[0]?._id); }).catch((e) => setErr(msg(e)));
  useEffect(() => { load(); api.get(`/courses/${id}/quizzes`).then((r) => setQz(r.data.quizzes)).catch(() => setQz([])); }, [id]);
  if (err) return <div className="card text-red-700">{err}</div>;
  if (!d) return <p>Loading…</p>;
  const all = d.modules.flatMap((m) => m.lessons), done = d.completed.map(String), lesson = all.find((l) => l._id === sel);
  const pct = all.length ? Math.round((done.length / all.length) * 100) : 0;
  async function toggle(l) { try { await api.post(`/lessons/${l._id}/complete`, { completed: !done.includes(l._id) }); await load(); toast('Progress saved'); } catch (e) { toast(msg(e)); } }
  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <div className="card self-start"><h2 className="font-bold">{d.course.title}</h2>
        {d.enrolled && <><div className="my-2 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-brand-600" style={{ width: pct + '%' }} /></div><p className="text-xs text-slate-500">{pct}% complete</p></>}
        {d.modules.map((m, i) => <div key={m._id} className="mt-3"><div className="text-xs font-semibold text-slate-500">Module {i + 1} of {d.modules.length}: {m.title}</div>
          {m.lessons.map((l) => <button key={l._id} onClick={() => setSel(l._id)} className={`flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm ${sel === l._id ? 'bg-brand-50 font-semibold text-brand-600' : 'hover:bg-slate-100'}`}>
            {l.locked ? <Lock size={14} /> : done.includes(l._id) ? <CheckCircle2 size={14} className="text-brand-600" /> : <Circle size={14} />}{l.title}</button>)}</div>)}
        {qz.length > 0 && <div className="mt-4 border-t pt-3"><div className="text-xs font-semibold text-slate-500">Quizzes</div>{qz.map((q) => <div key={q._id} className="mt-2 text-sm"><b>{q.title}</b><div className="text-xs text-slate-500">{q.questions} questions · {q.timeLimitMin ? q.timeLimitMin + ' min' : 'untimed'} · pass {q.passPercent}% · {q.attemptsUsed}/{q.maxAttempts || '∞'} attempts{q.best != null ? ` · best ${q.best}%` : ''}</div><Link className="btn btn-p mt-1" to={`/quiz/${q._id}`}>{q.attemptsUsed ? 'Retake' : 'Start'}</Link></div>)}</div>}</div>
      <div className="card">{d.completedAt && <div className="mb-3 rounded-lg bg-brand-50 p-3 text-sm font-semibold text-brand-700">🎉 Course completed — <Link className="underline" to="/certificates">view your certificate</Link></div>}{!lesson ? <p>This course has no lessons yet.</p> : <>
        <h1 className="text-xl font-bold">{lesson.title}</h1>
        {lesson.locked ? <p className="mt-3 text-slate-600">Enroll in this course to unlock this lesson.</p> : <>{lesson.videoUrl ? <video className="my-3 h-48 w-full rounded-xl bg-slate-900 object-cover" controls src={lesson.videoUrl} /> : <div className="my-3 grid h-48 place-items-center rounded-xl bg-[#173431] text-sm font-bold text-[#c2d8ce]">Lesson content</div>}<p className="text-slate-700">{lesson.content}</p></>}
        {d.enrolled && !lesson.locked && <button className={`btn mt-4 ${done.includes(lesson._id) ? '' : 'btn-p'}`} onClick={() => toggle(lesson)}>{done.includes(lesson._id) ? '✓ Completed (undo)' : 'Mark as complete'}</button>}</>}</div>
      {d.enrolled && <div className="card"><h2 className="mb-3 text-lg font-bold">Assignments</h2><Assignments courseId={id} /></div>}
    </div>
  );
}

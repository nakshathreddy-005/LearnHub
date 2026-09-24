import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
const LAND = { INSTRUCTOR: '/manage', REVIEWER: '/reviews', ADMIN: '/users' };
export default function Home() {
  const { user } = useAuth(), [s, setS] = useState(null);
  useEffect(() => { if (user.role === 'STUDENT') api.get('/students/me/summary').then((r) => setS(r.data)); }, [user.role]);
  if (LAND[user.role]) return <Navigate to={LAND[user.role]} replace />;
  if (user.role === 'MENTOR') return <Navigate to="/mentor" replace />;
  if (!s) return <p>Loading…</p>;
  const en = s.enrollments, avg = en.length ? Math.round(en.reduce((a, e) => a + e.pct, 0) / en.length) : 0;
  return (
    <div className="space-y-4">
      <section className="relative overflow-hidden rounded-[2rem] bg-[#173431] p-6 text-white shadow-[0_16px_36px_rgba(23,52,49,0.2)] md:p-8">
        <div className="relative z-10 max-w-xl"><p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f4b183]">Your learning desk</p><h1 className="text-3xl font-black tracking-tight md:text-4xl">Welcome back, {user.name.split(' ')[0]}.</h1><p className="mt-3 max-w-md text-sm leading-6 text-[#c2d8ce]">Keep your momentum moving. Pick up a course, revisit a weak concept, or follow your next deadline.</p><Link className="mt-5 inline-flex rounded-md bg-[#f4b183] px-4 py-2.5 text-sm font-black text-[#173431] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#ffc49c]" to="/ai">Open learning path</Link></div>
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full border-[28px] border-[#28554c] opacity-70" /><div className="absolute -bottom-24 right-24 h-44 w-44 rounded-full border-[20px] border-[#f4b183] opacity-20" />
      </section>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[['Enrolled', en.length], ['Avg progress', avg + '%'], ['Avg quiz score', s.quiz.avg == null ? '–' : s.quiz.avg + '%'], ['Quizzes passed / failed', `${s.quiz.passed} / ${s.quiz.failed}`], ['Certificates', s.certificates]].map(([l, v]) => <div key={l} className="card"><div className="text-2xl font-bold">{v}</div><div className="text-sm text-slate-500">{l}</div></div>)}</div>
      <h2 className="text-lg font-bold">Continue learning</h2>
      {!en.length && <div className="card">You have not enrolled yet. <Link className="text-brand-600 underline" to="/courses">Explore courses</Link></div>}
      <div className="grid gap-3 sm:grid-cols-2">{en.map((e) => (
        <div key={e.courseId} className="card"><h3 className="font-semibold">{e.title}</h3><p className="text-sm text-slate-500">{e.lessons.done}/{e.lessons.total} lessons · {e.quizzes.passed}/{e.quizzes.total} quizzes passed{e.completed ? ' · Completed 🎉' : e.next ? ` · Next: ${e.next}` : ''}</p>
          <div className="my-2 h-2 rounded bg-slate-200"><div className="h-2 rounded bg-brand-600" style={{ width: `${e.pct}%` }} /></div><Link className="btn btn-p" to={`/learn/${e.courseId}`}>{e.completed ? 'Review' : 'Continue'}</Link></div>))}</div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card"><div className="mb-2 flex justify-between"><h3 className="font-bold">Recent quiz results</h3><Link className="text-sm text-brand-600" to="/results">All results</Link></div>
          {!s.quiz.recent.length ? <p className="text-sm text-slate-500">No quizzes taken yet.</p> : s.quiz.recent.map((q) => <Link key={q._id} to={`/results/${q._id}`} className="flex justify-between py-1 text-sm hover:text-brand-600"><span>{q.quiz}</span><b className={q.passed ? 'text-green-700' : 'text-red-700'}>{q.percentage}%</b></Link>)}</div>
        <div className="card"><h3 className="mb-2 font-bold">Weak concepts</h3>{!s.weakConcepts.length ? <p className="text-sm text-slate-500">None detected yet. Take a quiz to find out.</p> : s.weakConcepts.map((c) => <div key={c.concept} className="mb-2 text-sm"><div className="flex justify-between"><span>{c.concept}</span><span>{c.pct}%</span></div><div className="h-1.5 rounded bg-slate-200"><div className="h-1.5 rounded bg-amber-500" style={{ width: c.pct + '%' }} /></div></div>)}<Link className="btn btn-p mt-2" to="/ai">View AI learning path</Link></div></div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card"><div className="mb-2 flex justify-between"><h3 className="font-bold">Upcoming deadlines</h3>{s.deadlines.length > 0 && <span className="text-xs text-slate-500">{s.deadlines.length} due soon</span>}</div>
          {!s.deadlines.length ? <p className="text-sm text-slate-500">No upcoming assignments.</p> : s.deadlines.map((a) => <Link key={a._id} to={`/courses/${a.course._id}/assignments`} className="block border-t py-2 text-sm hover:text-brand-600"><div className="flex justify-between gap-2"><b>{a.title}</b><span>{new Date(a.dueDate).toLocaleDateString()}</span></div><span className="text-slate-500">{a.course.title} · {a.submission?.status || 'Not submitted'}</span></Link>)}
        </div>
        <div className="card"><h3 className="mb-2 font-bold">Mentoring sessions</h3>
          {!s.sessions.length ? <p className="text-sm text-slate-500">No sessions scheduled.</p> : s.sessions.map((session) => <div key={session._id} className="border-t py-2 text-sm"><b>{session.topic}</b><p className="text-slate-500">{new Date(session.scheduledFor).toLocaleString()} · Mentor: {session.mentor?.name || 'Assigned mentor'}</p>{session.meetingLink && <a className="text-brand-600 underline" href={session.meetingLink} target="_blank" rel="noreferrer">Join meeting</a>}</div>)}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import api, { msg } from '../services/api';
import { toast } from '../utils/toast';

export default function Analytics({ admin = false }) {
  const [data, setData] = useState(null);
  useEffect(() => { api.get(admin ? '/analytics/admin' : '/analytics/instructor').then((response) => setData(response.data)).catch((error) => toast(msg(error))); }, [admin]);
  if (!data) return <p>Loading...</p>;
  const values = admin ? [['Users', data.users.total], ['Courses', data.courses.total], ['Published', data.courses.published], ['Awaiting review', data.courses.awaiting], ['Enrollments', data.totalEnrollments], ['Completed', data.completedCourses], ['Certificates', data.certificates], ['Quiz attempts', data.quizAttempts], ['Submissions', data.assignmentSubmissions]] : [['Courses', data.totalCourses], ['Published', data.publishedCourses], ['Enrollments', data.totalEnrollments], ['Active learners', data.activeLearners], ['Completion rate', `${data.completionRate}%`], ['Average quiz score', data.averageQuizScore == null ? '—' : `${data.averageQuizScore}%`], ['Quiz pass rate', data.quizPassRate == null ? '—' : `${data.quizPassRate}%`], ['Assignment submissions', data.assignmentSubmissionCount], ['Pending grading', data.pendingSubmissions]];
  return <div className="space-y-4">
    <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Performance overview</p><h1 className="text-3xl font-black">{admin ? 'Platform analytics' : 'Instructor analytics'}</h1></div>
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{values.map(([label, value]) => <div className="card" key={label}><b className="text-2xl">{value}</b><p className="text-sm text-slate-500">{label}</p></div>)}</div>
    {admin ? <div className="card"><h2 className="mb-2 font-bold">Users by role</h2>{Object.entries(data.users.roles).map(([role, count]) => <div className="flex justify-between border-t py-2 text-sm" key={role}><span>{role}</span><b>{count}</b></div>)}</div> : <div className="grid gap-4 md:grid-cols-2">
      <div className="card"><h2 className="mb-2 font-bold">Learner weak concepts</h2>{!data.weakConcepts?.length ? <p className="text-sm text-slate-500">No quiz concept data yet.</p> : data.weakConcepts.map((item) => <div className="border-t py-2 text-sm" key={item.concept}><div className="flex justify-between"><span>{item.concept}</span><b>{item.pct}%</b></div><div className="mt-1 h-1.5 rounded bg-slate-200"><div className="h-1.5 rounded bg-amber-500" style={{ width: `${item.pct}%` }} /></div></div>)}</div>
      <div className="card"><h2 className="mb-2 font-bold">Recent learner activity</h2>{!data.recentActivity?.length ? <p className="text-sm text-slate-500">No recent learner activity.</p> : data.recentActivity.map((item) => <div className="border-t py-2 text-sm" key={item._id}><b>{item.user?.name || 'Learner'}</b><p className="text-slate-500">{item.action} · {new Date(item.createdAt).toLocaleString()}</p></div>)}</div>
    </div>}
  </div>;
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import api, { msg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from '../utils/toast';
export default function Courses() {
  const { user } = useAuth(), [q, setQ] = useState(''), [level, setLevel] = useState(''), [category, setCategory] = useState(''), [categories, setCategories] = useState([]), [list, setList] = useState(null), [mine, setMine] = useState([]), [enrolling, setEnrolling] = useState(''), [enrollmentsLoaded, setEnrollmentsLoaded] = useState(false);
  const load = () => api.get('/courses', { params: { q, level, category } }).then((r) => setList(r.data.courses));
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [q, level, category]);
  useEffect(() => { api.get('/categories').then(r => setCategories(r.data.categories.filter(c => c.status === 'ACTIVE'))); }, []);
  useEffect(() => {
    if (user.role !== 'STUDENT') {
      setEnrollmentsLoaded(true);
      return;
    }
    api.get('/enrollments/me')
      .then((r) => setMine(r.data.enrollments.map((e) => String(e.courseId))))
      .catch((e) => toast(msg(e)))
      .finally(() => setEnrollmentsLoaded(true));
  }, []);
  async function enroll(id) {
    setEnrolling(id);
    try {
      await api.post(`/courses/${id}/enroll`);
      setMine((current) => current.includes(id) ? current : [...current, id]);
      toast('Enrolled successfully');
    } catch (e) {
      if (e.response?.status === 409) {
        try {
          const { data } = await api.get('/enrollments/me');
          const enrolledIds = data.enrollments.map((enrollment) => String(enrollment.courseId));
          setMine(enrolledIds);
          if (enrolledIds.includes(id)) {
            toast('You are already enrolled in this course');
            return;
          }
        } catch (refreshError) {
          toast(msg(refreshError));
          return;
        }
      }
      toast(msg(e));
    } finally {
      setEnrolling('');
    }
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Explore courses</h1>
      <div className="flex flex-wrap gap-2"><div className="relative min-w-[200px] flex-1"><Search size={14} className="absolute left-3 top-3 text-slate-400" /><input className="input pl-8" placeholder="Search courses" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select className="input w-auto" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Any category</option>{categories.map(c=><option key={c._id}>{c.name}</option>)}</select><select className="input w-auto" value={level} onChange={(e) => setLevel(e.target.value)}><option value="">Any level</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
      {!list ? <p>Loading…</p> : !list.length ? <div className="card">No courses match your search.</div> :
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{list.map((c) => (
          <div key={c._id} className="card"><div className="text-xs text-slate-500">{c.category} · {c.level}</div><h3 className="font-semibold">{c.title}</h3>
            <p className="mb-3 text-sm text-slate-600">{c.instructor?.name} · {c.duration}</p>
            {user.role !== 'STUDENT' ? null : mine.includes(c._id) ? <Link to={`/learn/${c._id}`} className="btn btn-p">Continue</Link> : <button className="btn btn-p" disabled={!enrollmentsLoaded || enrolling === c._id} onClick={() => enroll(c._id)}>{!enrollmentsLoaded ? 'Checking…' : enrolling === c._id ? 'Enrolling…' : 'Enroll'}</button>}
            {user.role !== 'STUDENT' && <Link to={`/learn/${c._id}`} className="btn">View</Link>}</div>))}</div>}
    </div>
  );
}

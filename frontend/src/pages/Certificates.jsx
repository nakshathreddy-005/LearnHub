import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck } from 'lucide-react';
import api from '../services/api';
import { toast } from '../utils/toast';
export function CertCard({ c }) {
  return (
    <div className="rounded-lg border-4 border-double border-brand-600 bg-white p-6 text-center print:border-black">
      <Award className="mx-auto text-brand-600" size={36} /><div className="text-xs uppercase tracking-widest text-slate-500">Certificate of Completion</div>
      <div className="my-2 text-sm text-slate-600">This certifies that</div><div className="font-serif text-3xl font-bold">{c.studentName}</div>
      <div className="my-2 text-sm text-slate-600">has successfully completed</div><div className="font-serif text-xl font-semibold text-brand-700">{c.courseTitle}</div>
      <div className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-slate-600"><span>Instructor: {c.instructorName}</span><span>{new Date(c.completedAt).toLocaleDateString()}</span><span>ID: {c.certificateId}</span></div>
    </div>
  );
}
export default function Certificates() {
  const [list, setList] = useState(null);
  useEffect(() => { api.get('/certificates/me').then((r) => setList(r.data.certificates)); }, []);
  if (!list) return <p>Loading…</p>;
  return (
    <div className="space-y-4"><h1 className="text-2xl font-bold">My certificates</h1>
      {!list.length && <div className="card">Complete every lesson and required quiz in a course to earn your first certificate. <Link className="text-brand-600 underline" to="/">Back to dashboard</Link></div>}
      {list.map((c) => <div key={c._id} className="space-y-2"><CertCard c={c} /><div className="flex flex-wrap items-center gap-2"><span className="inline-flex items-center gap-1 text-sm font-semibold text-green-700"><ShieldCheck size={16} />Verified</span>
        <Link className="btn" to={`/verify-certificate/${c.certificateId}`}>Verify certificate</Link><button className="btn" onClick={() => { navigator.clipboard?.writeText(`${location.origin}/verify-certificate/${c.certificateId}`); toast('Verification link copied'); }}>Copy link</button><button className="btn" onClick={() => window.print()}>Print</button></div></div>)}</div>
  );
}

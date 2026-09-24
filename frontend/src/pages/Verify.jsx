import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import api from '../services/api';
import { CertCard } from './Certificates';
export default function Verify() {
  const { certificateId } = useParams(), [d, setD] = useState(null);
  useEffect(() => { api.get(`/certificates/verify/${certificateId}`).then((r) => setD(r.data)).catch(() => setD({ verified: false })); }, [certificateId]);
  return (
    <div className="min-h-screen bg-slate-50 p-4"><div className="mx-auto max-w-2xl space-y-4"><div className="flex items-center gap-2 text-xl font-extrabold text-brand-600"><GraduationCap />LearnHub</div>
      {!d ? <p>Checking certificate…</p> : d.verified ? <><div className="card text-lg font-bold text-green-700">✓ Certificate Verified</div><CertCard c={d.certificate} /></> : <div className="card"><h1 className="text-lg font-bold text-red-700">Certificate not found</h1><p className="text-sm text-slate-600">No certificate matches “{certificateId}”. Check the ID and try again.</p></div>}
      <Link className="text-sm text-brand-600" to="/login">Go to LearnHub</Link></div></div>
  );
}

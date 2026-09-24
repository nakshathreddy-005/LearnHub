import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { msg } from '../services/api';
export default function Auth({ register }) {
  const { login, register: reg } = useAuth(), nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' }), [e, setE] = useState(''), [busy, setBusy] = useState(false);
  const on = (k) => (x) => setF({ ...f, [k]: x.target.value });
  async function submit(ev) { ev.preventDefault(); setBusy(true); setE(''); try { register ? await reg(f) : await login(f.email, f.password); nav('/'); } catch (x) { setE(msg(x)); } setBusy(false); }
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 p-4">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-3">
        <div className="flex items-center gap-2 text-xl font-extrabold text-brand-600"><GraduationCap />LearnHub</div>
        <h1 className="text-lg font-bold">{register ? 'Create your student account' : 'Sign in'}</h1>
        {register && <input className="input" placeholder="Full name" value={f.name} onChange={on('name')} required />}
        <input className="input" type="email" placeholder="Email" value={f.email} onChange={on('email')} required />
        <input className="input" type="password" placeholder="Password (6+ characters)" value={f.password} onChange={on('password')} required minLength={6} />
        {e && <p role="alert" className="text-sm text-red-700">{e}</p>}
        <button className="btn btn-p w-full justify-center" disabled={busy}>{busy ? 'Please wait…' : register ? 'Create account' : 'Sign in'}</button>
        <p className="text-sm text-slate-600">{register ? <Link to="/login" className="text-brand-600">Already registered? Sign in</Link> : <Link to="/register" className="text-brand-600">New here? Create an account</Link>}</p>
      </form>
    </div>
  );
}

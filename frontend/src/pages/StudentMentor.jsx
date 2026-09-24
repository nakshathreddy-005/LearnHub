import { useEffect, useState } from 'react';
import api, { msg } from '../services/api';
import { toast } from '../utils/toast';

export default function StudentMentor() {
  const [data, setData] = useState(null);
  useEffect(() => {
    api.get('/mentor/me').then((response) => setData(response.data)).catch((error) => toast(msg(error)));
  }, []);
  if (!data) return <p>Loading...</p>;
  return <div className="space-y-4">
    <h1 className="text-2xl font-bold">My mentor</h1>
    {!data.mentor ? <div className="card text-sm text-slate-500">A mentor has not been assigned yet.</div> : <div className="card">
      <h2 className="font-bold">{data.mentor.name}</h2>
      <p className="text-sm text-slate-500">{data.mentor.email}</p>
      {data.mentor.bio && <p className="mt-2 text-sm">{data.mentor.bio}</p>}
    </div>}
    <div className="card">
      <h2 className="mb-2 font-bold">Mentoring sessions</h2>
      {!data.sessions.length ? <p className="text-sm text-slate-500">No sessions scheduled.</p> : data.sessions.map((session) => <div className="border-t py-2 text-sm" key={session._id}>
        <div className="flex flex-wrap justify-between gap-2"><b>{session.topic}</b><span>{new Date(session.scheduledFor).toLocaleString()}</span></div>
        <p className="text-slate-500">{session.status}{session.mentor?.name ? ` · ${session.mentor.name}` : ''}</p>
        {session.notes && <p className="mt-1">{session.notes}</p>}
        {session.meetingLink && <a className="text-brand-600 underline" href={session.meetingLink} target="_blank" rel="noreferrer">Join meeting</a>}
      </div>)}
    </div>
    <div className="card">
      <h2 className="mb-2 font-bold">Mentor feedback</h2>
      {!data.notes.length ? <p className="text-sm text-slate-500">No feedback yet.</p> : data.notes.map((note) => <div className="border-t py-2 text-sm" key={note._id}>
        <p>{note.note}</p><p className="text-xs text-slate-500">{note.mentor?.name || 'Mentor'} · {new Date(note.createdAt).toLocaleString()}</p>
      </div>)}
    </div>
  </div>;
}

import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { msg } from '../services/api';
import { toast } from '../utils/toast';

export default function Assignments({ courseId, instructor = false }) {
  const [items, setItems] = useState(null);
  const [detail, setDetail] = useState(null);
  const [submission, setSubmission] = useState({});
  const load = () => api.get(`/courses/${courseId}/assignments`).then((response) => setItems(response.data.assignments)).catch((error) => toast(msg(error)));
  useEffect(() => { load(); }, [courseId]);

  const submit = async (assignment) => {
    if (!submission[assignment._id]?.trim()) return toast('Enter submission text first');
    try { await api.post(`/assignments/${assignment._id}/submit`, { content: submission[assignment._id] }); toast('Assignment submitted'); setSubmission({ ...submission, [assignment._id]: '' }); load(); } catch (error) { toast(msg(error)); }
  };
  const edit = async (assignment) => {
    const title = prompt('Assignment title', assignment.title);
    if (title === null) return;
    const dueDate = prompt('Due date (YYYY-MM-DDTHH:MM)', assignment.dueDate.slice(0, 16));
    if (dueDate === null) return;
    try { await api.put(`/assignments/${assignment._id}`, { title, dueDate, description: assignment.description, instructions: assignment.instructions, maximumMarks: assignment.maximumMarks }); toast('Assignment updated'); load(); } catch (error) { toast(msg(error)); }
  };
  const remove = async (assignment) => {
    if (!confirm('Delete this assignment and its submissions?')) return;
    try { await api.delete(`/assignments/${assignment._id}`); toast('Assignment deleted'); load(); } catch (error) { toast(msg(error)); }
  };
  const viewSubmissions = async (assignment) => { try { setDetail((await api.get(`/assignments/${assignment._id}/submissions`)).data); } catch (error) { toast(msg(error)); } };
  const grade = async (row) => {
    const marks = prompt(`Marks (out of ${detail.assignment.maximumMarks})`, row.marks ?? '');
    if (marks === null) return;
    const feedback = prompt('Feedback', row.feedback || '');
    if (feedback === null) return;
    try { await api.patch(`/submissions/${row._id}/grade`, { marks, feedback }); toast('Grade saved'); viewSubmissions(detail.assignment); } catch (error) { toast(msg(error)); }
  };
  if (!items) return <p>Loading...</p>;
  return <div className="space-y-2">
    {!items.length && <p className="text-sm text-slate-500">No assignments.</p>}
    {items.map((assignment) => <div className="rounded border p-3" key={assignment._id}>
      <div className="flex flex-wrap justify-between gap-2"><b>{assignment.title}</b><span className="text-sm text-slate-600">Due {new Date(assignment.dueDate).toLocaleString()} · {assignment.maximumMarks} marks</span></div>
      {assignment.description && <p className="mt-1 text-sm">{assignment.description}</p>}
      {assignment.instructions && <p className="mt-1 text-sm text-slate-600">Instructions: {assignment.instructions}</p>}
      {instructor ? <div className="mt-2 flex gap-2"><button className="btn" onClick={() => edit(assignment)}>Edit</button><button className="btn" onClick={() => remove(assignment)}>Delete</button><button className="btn btn-p" onClick={() => viewSubmissions(assignment)}>Submissions</button></div> : <>
        <p className="mt-1 text-xs">{assignment.submission?.status || 'NOT SUBMITTED'} {assignment.submission?.marks != null ? `· ${assignment.submission.marks}/${assignment.maximumMarks}` : ''}</p>
        {assignment.submission?.feedback && <p className="text-sm text-brand-700">Feedback: {assignment.submission.feedback}</p>}
        {new Date(assignment.dueDate) >= new Date() && <><textarea className="input mt-2" rows="3" value={submission[assignment._id] ?? assignment.submission?.content ?? ''} onChange={(event) => setSubmission({ ...submission, [assignment._id]: event.target.value })} placeholder="Write your submission" /><button className="btn btn-p mt-2" onClick={() => submit(assignment)}>Submit / update</button></>}
      </>}
    </div>)}
    {detail && <div className="card"><div className="flex justify-between"><h3 className="font-bold">{detail.assignment.title} submissions</h3><button className="btn" onClick={() => setDetail(null)}>Close</button></div>{!detail.submissions.length && <p className="mt-2 text-sm text-slate-500">No submissions yet.</p>}{detail.submissions.map((row) => <div className="border-t py-2" key={row._id}><b>{row.student.name}</b><p className="whitespace-pre-wrap text-sm">{row.content || 'No text submission'}</p><p className="text-xs text-slate-500">{row.status}{row.marks != null ? ` · ${row.marks}/${detail.assignment.maximumMarks}` : ''}</p><button className="btn mt-1" onClick={() => grade(row)}>Grade</button></div>)}</div>}
  </div>;
}

export function StudentAssignments() { const { courseId } = useParams(); return <div><h1 className="mb-4 text-2xl font-bold">Assignments</h1><Assignments courseId={courseId} /></div>; }

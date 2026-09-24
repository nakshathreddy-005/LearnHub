// AI abstraction. AI_MODE=demo (default) is rule-based, deterministic and needs no API key.
// To plug in a real model, add providers.<name> with the same signature and set AI_MODE=<name>.
const demo = async ({ goal, enrollments, concepts, revisions, pendingQuizzes, assignmentPerformance = [] }) => {
  const weak = concepts.filter((c) => c.pct < 60), strong = concepts.filter((c) => c.pct >= 80 && c.total >= 2);
  const strengths = [...strong.map((c) => `${c.concept}: ${c.pct}% correct (${c.right}/${c.total})`), ...enrollments.filter((e) => e.pct >= 60 && !e.completed).map((e) => `Strong momentum in ${e.title} (${e.pct}%)`)];
  const weaknesses = [...weak.map((c) => `${c.concept}: only ${c.pct}% correct (${c.right}/${c.total})`), ...assignmentPerformance.filter(a => a.percentage < 60).map(a => `${a.title}: ${a.percentage}% on a graded assignment`)];
  const path = [], w0 = weak[0], w1 = weak[1] || weak[0], rev = revisions.find((r) => r.concept === w0?.concept), active = enrollments.filter((e) => !e.completed).sort((a, b) => a.pct - b.pct)[0], pq = pendingQuizzes[0];
  if (w0) path.push({ type: 'Review concept', step: `Review ${w0.concept}`, priority: 'High', reason: `You answered only ${w0.pct}% of ${w0.concept} questions correctly.`, activity: rev?.lesson ? `Re-read "${rev.lesson}"` : 'Re-read your notes and examples', effort: '30 min', courseId: rev?.courseId, link: rev?.courseId && `/learn/${rev.courseId}` });
  if (active?.next) path.push({ type: 'Complete lesson', step: `Complete lesson: ${active.next}`, priority: w0 ? 'Medium' : 'High', reason: `Finishing lessons in ${active.title} (${active.pct}% done) builds the base for the quiz.`, activity: 'Watch the video and mark the lesson complete', effort: '25 min', courseId: active.courseId, link: `/learn/${active.courseId}` });
  if (w1) path.push({ type: 'Practice questions', step: `Practice ${w1.concept} questions`, priority: 'Medium', reason: 'Active recall on a weak concept is the fastest way to improve it.', activity: 'Retake a quiz and focus on this concept', effort: '20 min', courseId: pq?.courseId || active?.courseId, link: pq ? `/quiz/${pq.quizId}` : undefined });
  if (pq) path.push({ type: 'Take quiz', step: `Take quiz: ${pq.title}`, priority: 'Medium', reason: 'A required quiz for your course is not yet passed.', activity: 'Attempt the quiz under timed conditions', effort: '15 min', courseId: pq.courseId, link: `/quiz/${pq.quizId}` });
  const lowAssignment = assignmentPerformance.find(a => a.percentage < 60);
  if (lowAssignment) path.push({ type: 'Improve assignment', step: `Review feedback: ${lowAssignment.title}`, priority: 'High', reason: `Your assignment score was ${lowAssignment.percentage}%. Use instructor feedback before the next submission.`, activity: 'Review the rubric and feedback', effort: '30 min', courseId: lowAssignment.courseId, link: lowAssignment.courseId && `/learn/${lowAssignment.courseId}` });
  if (w0) path.push({ type: 'Reassess', step: `Reassess ${w0.concept}`, priority: 'Low', reason: 'Confirm the revision worked and update your learning path.', activity: 'Retake the quiz and compare your score', effort: '15 min', link: pq ? `/quiz/${pq.quizId}` : undefined });
  if (!path.length) path.push({ type: 'Get started', step: enrollments.length ? 'Take your first quiz' : 'Enroll in your first course', priority: 'High', reason: 'Quiz results unlock personalized recommendations.', activity: enrollments.length ? 'Open a course and start a quiz' : 'Browse courses', effort: '10 min', link: enrollments.length ? `/learn/${enrollments[0].courseId}` : '/courses' });
  return { mode: 'demo', goal, strengths, weaknesses, revisions, path, basedOn: { conceptsTested: concepts.length } };
};
const gemini = async (data) => {
  if (!process.env.GEMINI_API_KEY) return demo(data);
  const prompt = `You are a learning coach. Return only valid JSON with keys strengths, weaknesses, path. path is an array of objects with type, step, priority (High/Medium/Low), reason, activity, effort. Personalize from this learner data: ${JSON.stringify({ goal: data.goal, enrollments: data.enrollments, concepts: data.concepts, revisions: data.revisions, pendingQuizzes: data.pendingQuizzes, assignmentPerformance: data.assignmentPerformance })}`;
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${process.env.GEMINI_MODEL || 'gemini-2.0-flash'}:generateContent?key=${process.env.GEMINI_API_KEY}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
  if (!response.ok) throw new Error(`Gemini request failed with ${response.status}`);
  const result = await response.json();
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const parsed = JSON.parse(text.replace(/^```json\s*/i, '').replace(/\s*```$/, ''));
  return { mode: 'gemini', goal: data.goal, strengths: parsed.strengths || [], weaknesses: parsed.weaknesses || [], revisions: data.revisions, path: parsed.path || [], basedOn: { conceptsTested: data.concepts.length } };
};
const providers = { demo, gemini };
export const generateLearningPath = async (data) => { const provider = providers[process.env.AI_MODE] || demo; try { return await provider(data); } catch (error) { console.error('AI provider failed; using fallback:', error.message); return demo(data); } };

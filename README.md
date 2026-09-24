# LearnHub – MERN

React + Vite + Tailwind + React Router + Axios + Lucide  |  Node + Express + MongoDB (Mongoose) + JWT (HTTP-only cookie) + bcryptjs.
No Supabase, SQL, Firebase or required AI key. AI runs in **demo mode** by default.

## Run locally
1. Start MongoDB (local) or create a MongoDB Atlas cluster and put its URI in `backend/.env`.
2. Backend:  `cd backend && npm install && npm run seed && npm run dev`   (http://localhost:5000)
3. Frontend: `cd frontend && npm install && npm run dev`                   (http://localhost:5173)

`backend/.env` is pre-created from `.env.example`. **Change `JWT_SECRET`** before deploying.

## Demo accounts (password `Password123!`)
admin@ / instructor@ / reviewer@ / student@ / mentor@ `learnhub.demo`

## Security rules enforced on the API
- Registration always creates a STUDENT; only an ADMIN can change roles (`PATCH /api/admin/users/:id/role`).
- Instructors can modify only their own courses, cannot review, and can publish only APPROVED courses.
- Only REVIEWERs can approve/reject/request changes (never on their own course). Students see locked lessons until enrolled.

## AI
`backend/src/services/aiService.js` – `AI_MODE=demo` works offline from progress data. Add a provider function with the same signature to plug in a real model later.

## Implemented (v2)
Quiz engine (question bank, randomized subset, timer, attempt limits, auto-scoring, explanations only after submit, per-concept weak-topic detection), quiz-aware progress and course completion (lessons + required quizzes), one certificate per course with public verification at `/verify-certificate/:id` (demo ID `LH-2026-DEMO0001`), notifications (bell, page, read/read-all), AI path driven by real quiz/concept/progress data (demo mode), shared backend validator, expanded seed data.

## Implemented demo workflows
Assignments and grading, mentor learner dashboard and sessions, instructor and admin analytics, category management, course-info editing, module and lesson reordering, review history, audit logs, and student upcoming deadlines are implemented with MongoDB-backed data. Student assignments are visible in enrolled course pages, and deadlines plus mentoring sessions are shown on the student dashboard.

`.gitignore` excludes `node_modules`; run `npm install` in both folders.

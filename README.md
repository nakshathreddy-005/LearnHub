# LearnHub – MERN

React + Vite + Tailwind + React Router + Axios + Lucide  |  Node + Express + MongoDB (Mongoose) + JWT (HTTP-only cookie) + bcryptjs.
No Supabase, SQL, Firebase or required AI key. AI runs in **demo mode** by default.

## Run locally
1. Start MongoDB (local) or create a MongoDB Atlas cluster and put its URI in `backend/.env`.
2. Backend:  `cd backend && npm install && npm run seed && npm run dev`   (http://localhost:5000)
3. Frontend: `cd frontend && npm install && npm run dev`                   (http://localhost:5173)

`backend/.env` is pre-created from `.env.example`, but it should only contain local/dev values. For deployment, set the real values in your host environment (Render, Railway, Fly.io, Vercel, etc.) and do not commit secrets.

## Deployment environment
- Backend variables: `PORT` (usually provided by the host), `NODE_ENV=production`, `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, `AI_MODE`, `GEMINI_API_KEY`, `GEMINI_MODEL`
- Frontend required variables: `VITE_API_URL` (for example `https://api.your-domain.com/api` or `/api` when served behind the same origin)
- Example frontend env file: `frontend/.env.example`

## Production deployment checklist
1. Set `JWT_SECRET` to a long random value and keep it secret.
2. Use a MongoDB Atlas connection string in `MONGO_URI`.
3. Set `CLIENT_URL` to the deployed frontend origin.
4. Set `VITE_API_URL` to the deployed backend URL including `/api`.
5. Build frontend with `npm run build` and serve the `dist` folder.
6. Run backend with `npm start` on the target host.
7. Configure the frontend host to rewrite unknown paths to `index.html` so React Router routes work after refresh.

For cookie-based authentication, prefer a frontend and backend on the same site (for example, `learnhub.example.com` and `api.learnhub.example.com`). Separate unrelated hostnames can cause browsers to block the auth cookie.

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

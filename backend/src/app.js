import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '1mb' })); app.use(cookieParser());
app.get('/api/health', (_q, r) => r.json({ ok: true }));
app.use('/api', routes);
app.use((_q, _r, next) => next(Object.assign(new Error('Route not found'), { status: 404 })));
app.use((e, _q, res, _n) => {
  let status = e.status || 500, message = e.message;
  if (e.name === 'ValidationError') status = 400; else if (e.name === 'CastError') { status = 400; message = 'Invalid id'; } else if (e.code === 11000) { status = 409; message = 'Duplicate value'; }
  if (status === 500) { console.error(e); message = 'Server error'; }
  res.status(status).json({ message, errors: e.errors });
});
export default app;

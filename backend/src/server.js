import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');
await connectDB();
app.listen(process.env.PORT || 5000, () => console.log(`API on http://localhost:${process.env.PORT || 5000}`));

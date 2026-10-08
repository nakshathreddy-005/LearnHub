import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is missing in .env');

const [{ default: app }, { default: connectDB }] = await Promise.all([
  import('./app.js'),
  import('./config/db.js'),
]);

await connectDB();
app.listen(process.env.PORT || 5000, () => console.log(`API on http://localhost:${process.env.PORT || 5000}`));

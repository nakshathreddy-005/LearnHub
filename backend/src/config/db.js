import mongoose from 'mongoose';
export default async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('MONGO_URI is missing. Set it in backend/.env.');
  try {
    await mongoose.connect(uri);
  } catch (error) {
    if (error?.code === 8000 || error?.codeName === 'AtlasError' || /authentication failed|bad auth/i.test(error?.message || '')) {
      throw new Error('MongoDB authentication failed. Check that MONGO_URI uses a MongoDB Database Access user with the correct password. URL-encode reserved characters in the password.');
    }
    throw error;
  }
  console.log('MongoDB connected');
}

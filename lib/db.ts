import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  // 🔍 DEBUG LOGGING
  console.log('🔍 Starting MongoDB connection...');
  console.log('📍 URI exists?', !!MONGODB_URI);
  console.log('📍 URI starts with:', MONGODB_URI?.substring(0, 20));
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env',
    );
  }

  if (cached.conn) {
     console.log('✅ Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

       console.log('🔌 Attempting new connection...');
    cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
      console.log('✅ MongoDB connected successfully!');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error('❌ MongoDB connection failed:', e);
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;

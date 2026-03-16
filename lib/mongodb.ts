import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// For mongoose
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const connectWithRetry = async (retries = 5, delayMs = 1000) => {
      for (let i = 0; i < retries; i += 1) {
        try {
          return await mongoose.connect(MONGODB_URI, opts);
        } catch (err) {
          if (i === retries - 1) throw err;
          // wait before retrying
          await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
      }
      throw new Error('Failed to connect to MongoDB');
    };

    cached.promise = connectWithRetry();
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// For next-auth adapter
const uri = MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

const connectWithRetry = async (client: MongoClient, retries = 5, delayMs = 1000) => {
  for (let i = 0; i < retries; i += 1) {
    try {
      return await client.connect();
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error('Failed to connect to MongoDB');
};

if (process.env.NODE_ENV === 'development') {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = connectWithRetry(client);
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = connectWithRetry(client);
}

export default dbConnect;
export { clientPromise };
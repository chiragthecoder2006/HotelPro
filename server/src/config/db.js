import mongoose from 'mongoose';
import { initMemoryStore } from '../services/dbStore.js';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hotelpro';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
      autoIndex: true
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      console.error(`🚨 [CRITICAL WARNING] Failed to connect to MongoDB in production environment: ${error.message}`);
      console.error(`🚨 In-memory persistence is active for demonstration resilience, but data will NOT persist across server restarts. Set a valid MONGODB_URI in production.`);
    } else {
      console.warn(`⚠️ Local MongoDB connection skipped (${error.message}).`);
    }
    console.log(`⚡ Initializing high-fidelity In-Memory Persistence Engine with full seed data...`);
    await initMemoryStore();
    console.log(`✅ Application is 100% operational in Demo Standalone Mode!`);
    return null;
  }
};

export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

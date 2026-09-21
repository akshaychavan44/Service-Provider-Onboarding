const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  // If already connected or connecting, reuse existing connection
  if (isConnected || mongoose.connection.readyState >= 1) {
    isConnected = true;
    return;
  }

  try {
    const mongoURI =
      process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/trizen_onboarding';

    if (mongoURI.includes('<db_password>') || mongoURI.includes('<password>')) {
      throw new Error(
        'Placeholder <db_password> detected in MONGO_URI. Please replace it with your actual MongoDB Atlas database password.'
      );
    }

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
      bufferCommands: false, // Fail fast in serverless if connection drops
    });

    isConnected = true;
    console.log(
      `[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`
    );
  } catch (error) {
    isConnected = false;
    console.error(`[MongoDB Connection Error] ${error.message}`);
    // DO NOT call process.exit(1) in serverless environments as it crashes Vercel functions!
    throw error;
  }
};

module.exports = connectDB;

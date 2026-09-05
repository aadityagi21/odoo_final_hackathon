const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000 // 2 seconds timeout to detect if local MongoDB is live
    });
    console.log(`[MongoDB] Connected to MongoDB host: ${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`);
  } catch (err) {
    console.warn(`[MongoDB] Could not connect to local MongoDB daemon (${err.message}).`);
    console.log('[MongoDB] Initializing MongoMemoryServer in-memory fallback for seamless local execution...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      await mongoose.connect(mongoUri);
      console.log(`[MongoDB] Connected to MongoMemoryServer at ${mongoUri}`);
    } catch (memErr) {
      console.error('[MongoDB] Failed to start fallback database:', memErr.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;

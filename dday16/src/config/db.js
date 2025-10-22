const mongoose = require('mongoose');

async function connectDB(uri) {
  if (!uri) {
    console.warn('MONGO_URI not provided — running in mock mode (no DB).');
    return false;
  }

  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
    return true;
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    return false;
  }
}

module.exports = { connectDB };

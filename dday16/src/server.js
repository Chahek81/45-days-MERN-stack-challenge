require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const { connectDB } = require('./config/db');

const profileRoutes = require('./routes/profile');
const searchRoutes = require('./routes/search');
const analyticsRoutes = require('./routes/analytics');

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// routes
app.use('/api/profile', profileRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);

const PORT = process.env.PORT || 4000;

async function startServer() {
  const uri = process.env.MONGO_URI;
  const connected = await connectDB(uri);
  return new Promise((resolve) => {
    const server = app.listen(PORT, () => {
      console.log(`Server started on port ${PORT} (DB connected: ${connected})`);
      resolve(server);
    });
  });
}

// If this file is run directly, start the server. Otherwise export for tests.
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };

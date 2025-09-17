// Filename: app.js

const express = require('express');
const app = express();
const workExperienceRoutes = require('./routes/workExperienceRoutes');
const errorHandler = require('./middleware/errorMiddleware');

// Middleware
app.use(express.json());

// Routes
app.use('/api/work-experience', workExperienceRoutes);

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
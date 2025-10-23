require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const bodyParser = require('body-parser');
const promClient = require('prom-client');
const winston = require('winston');
const { register, collectDefaultMetrics } = require('prom-client');

// Logger setup
const isProd = process.env.NODE_ENV === 'production';
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: isProd
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} ${level}: ${message}${extra}`;
        })
      ),
  transports: [new winston.transports.Console()],
});

const app = express();

// Metrics
collectDefaultMetrics();
const httpRequestDurationMicroseconds = new promClient.Histogram({
  name: 'http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'code'],
  buckets: [50, 100, 200, 300, 500, 1000]
});

app.use((req, res, next) => {
  res.locals.startEpoch = Date.now();
  next();
});

// Middlewares
app.use(helmet());
app.use(compression());
app.use(bodyParser.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});
app.use(limiter);

// Simple health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (ex) {
    res.status(500).end(ex);
  }
});

// Example API
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hello from Day 18 API' });
});

// Response time metric collector
app.use((req, res, next) => {
  res.on('finish', () => {
    const responseTimeInMs = Date.now() - res.locals.startEpoch;
    httpRequestDurationMicroseconds.labels(req.method, req.path, res.statusCode).observe(responseTimeInMs);
  });
  next();
});

// Error handler
app.use((err, req, res, next) => {
  logger.error(err.message, { stack: err.stack });
  res.status(500).json({ error: 'Internal Server Error' });
});

// Export the app for tests/servers to use.
module.exports = app;

// If this file is run directly, start the server.
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => logger.info(`Server listening on port ${port}`));
}

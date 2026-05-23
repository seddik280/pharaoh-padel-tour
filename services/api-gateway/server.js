const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ── Security & logging middleware ─────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute window for testing
  max: 50,
  message: { message: 'Too many login attempts, please try again later.' }
});

app.use(globalLimiter);
app.use('/api/auth', authLimiter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => res.json({
  message: 'PadelPro API Gateway',
  version: '1.0.0',
  services: {
    auth:       process.env.AUTH_SERVICE_URL,
    users:      process.env.USER_SERVICE_URL,
    tournaments: process.env.TOURNAMENT_SERVICE_URL,
    matches:    process.env.MATCH_SERVICE_URL
  }
}));

// ── Proxy routes to microservices ─────────────────────────────────────────────
const makeProxy = (target, pathFilter) => createProxyMiddleware({
  target,
  changeOrigin: true,
  pathFilter,
  on: {
    error: (err, req, res) => {
      console.error(`Proxy error to ${target}:`, err.message);
      res.status(503).json({ message: `Service unavailable: ${target}` });
    }
  }
});

app.use(makeProxy(process.env.AUTH_SERVICE_URL,        '/api/auth/**'));
app.use(makeProxy(process.env.USER_SERVICE_URL,        '/api/users/**'));
app.use(makeProxy(process.env.TOURNAMENT_SERVICE_URL,  '/api/tournaments/**'));
app.use(makeProxy(process.env.TOURNAMENT_SERVICE_URL,  '/api/registrations/**'));
app.use(makeProxy(process.env.MATCH_SERVICE_URL,       '/api/matches/**'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => res.status(404).json({ message: `Route ${req.path} not found` }));

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n⚡ PadelPro API Gateway running on port ${PORT}`);
  console.log('   Auth Service      →', process.env.AUTH_SERVICE_URL);
  console.log('   User Service      →', process.env.USER_SERVICE_URL);
  console.log('   Tournament Service→', process.env.TOURNAMENT_SERVICE_URL);
  console.log('   Match Service     →', process.env.MATCH_SERVICE_URL);
});

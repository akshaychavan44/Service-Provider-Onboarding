const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Route imports
const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// Preflight CORS Handler for all routes
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept'
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  return res.sendStatus(200);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.use(morgan('dev'));
}

// Serve uploaded files statically
const staticUploads = process.env.VERCEL
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, 'uploads');
app.use('/uploads', express.static(staticUploads));

// Serverless DB Connection Middleware
app.use(async (req, res, next) => {
  // Allow health check, root, and non-API frontend navigation even without DB
  if (
    req.path === '/' ||
    req.path === '/api' ||
    req.path === '/api/' ||
    req.path === '/api/health' ||
    req.method === 'OPTIONS' ||
    (!req.path.startsWith('/api') &&
      !req.path.startsWith('/auth') &&
      !req.path.startsWith('/provider') &&
      !req.path.startsWith('/admin'))
  ) {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    if (process.env.NODE_ENV === 'development' && !process.env.VERCEL) {
      console.warn(`[MongoDB Warning] Offline mode active: ${err.message}`);
      return next();
    }
    return res.status(503).json({
      success: false,
      message:
        'Database connection failed. Please ensure MONGO_URI is properly configured with a valid MongoDB Atlas connection string in your Vercel Project Settings.',
      error: err.message,
    });
  }
});

// Root Welcome Endpoint (Accepts GET, POST, OPTIONS, etc.)
app.all('/', (req, res) => {
  const clientDist = path.join(__dirname, '../client/dist');
  if (req.method === 'GET' && fs.existsSync(path.join(clientDist, 'index.html'))) {
    return res.sendFile(path.join(clientDist, 'index.html'));
  }
  res.status(200).json({
    success: true,
    message: 'Trizen Service Provider Onboarding API is active.',
    environment: process.env.VERCEL ? 'Vercel Serverless' : (process.env.NODE_ENV || 'development'),
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      provider: '/api/provider',
      admin: '/api/admin',
    },
  });
});

app.all('/api', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Trizen Service Provider Onboarding API is active.',
  });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Trizen Service Provider Onboarding API is running smoothly.',
    timestamp: new Date(),
    environment: process.env.VERCEL ? 'Vercel Serverless' : (process.env.NODE_ENV || 'development'),
  });
});

// Mount Routes (under both /api/* and /* for maximum flexibility)
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api', authRoutes); // Supports /api/login, /api/register
app.use('/', authRoutes);    // Supports /login, /register

app.use('/api/provider', providerRoutes);
app.use('/provider', providerRoutes);

app.use('/api/admin', adminRoutes);
app.use('/admin', adminRoutes);

// Serve static frontend files if client/dist exists (allows opening app on port 5000 too)
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/auth') ||
      req.path.startsWith('/provider') ||
      req.path.startsWith('/admin') ||
      req.path.startsWith('/uploads')
    ) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only bind port locally (Vercel invokes the exported app handler)
if (!process.env.VERCEL && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[Trizen Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Export default app for Vercel Serverless Functions
module.exports = app;

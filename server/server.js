const express = require('express');
const cors = require('cors');
const path = require('path');
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
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);
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
  // Allow health check and root even without DB
  if (req.path === '/' || req.path === '/api/health') {
    return next();
  }

  try {
    await connectDB();
    next();
  } catch (err) {
    return res.status(503).json({
      success: false,
      message:
        'Database connection failed. Please ensure MONGO_URI is properly configured with a valid MongoDB Atlas connection string in your Vercel Project Settings.',
      error: err.message,
    });
  }
});

// Root Welcome Endpoint
app.get('/', (req, res) => {
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

// API Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Trizen Service Provider Onboarding API is running smoothly.',
    timestamp: new Date(),
    environment: process.env.VERCEL ? 'Vercel Serverless' : (process.env.NODE_ENV || 'development'),
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/admin', adminRoutes);

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

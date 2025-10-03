import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import connectDB from './db/config.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();
console.log("Loaded MONGO_URI:", process.env.MONGO_URI);
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());


// Enable CORS for all routes
app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Expose-Headers', 'set-cookie, jwt');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});
app.use(express.json());
app.use(cookieParser());

// Session configuration (if you're using sessions alongside JWT)
const isProduction = process.env.NODE_ENV === 'production';
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  proxy: true, // Required for secure cookies in production
  name: 'mentora.sid',
  cookie: {
    httpOnly: true,
    secure: isProduction, // Must be false for localhost in development
    sameSite: isProduction ? 'lax' : 'none',
    maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    path: '/',
    // Don't set domain for localhost as it can cause issues
    domain: isProduction ? '.yourdomain.com' : undefined
  }
}));

// Debug route to check environment
app.get('/api/debug', (req, res) => {
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
  res.json({ 
    hasJwtSecret: !!process.env.JWT_SECRET,
    nodeEnv: process.env.NODE_ENV || 'development',
    cookie: req.cookies,
    headers: req.headers
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  return res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    time: new Date().toISOString()
  });
});

app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
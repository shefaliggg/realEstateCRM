const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const unitRoutes = require('./routes/unitRoutes');
const leadRoutes = require('./routes/leadRoutes');
const dealRoutes = require('./routes/dealRoutes');

const app = express();

const isProduction = process.env.NODE_ENV === 'production';

// CORS Configuration
const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

if (isProduction) {
  corsOptions.origin = process.env.FRONTEND_URL || true;
} else {
  corsOptions.origin = 'http://localhost:5173';
}

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX || 150),
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth requests. Please try again later.' },
});

app.use('/api/auth', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/projects/:projectId/units', unitRoutes);
app.use('/api/units', unitRoutes); // direct unit lookup by id
app.use('/api/leads', leadRoutes);
app.use('/api/deals', dealRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });

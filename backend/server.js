const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');

// Use routes
app.use('/api', userRoutes);  // User routes with /api prefix
app.use('/api', authRoutes);  // Auth routes with /api prefix

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API Server with JWT Authentication',
    version: '2.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile (protected)'
      },
      users: {
        getAll: 'GET /api/users',
        create: 'POST /api/users',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id'
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

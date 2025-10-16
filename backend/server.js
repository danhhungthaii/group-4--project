const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require('./routes/user');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Use routes
app.use('/api', userRoutes);  // User routes with /api prefix
app.use('/api', authRoutes);  // Auth routes with /api prefix
app.use('/api', adminRoutes); // Admin routes with /api prefix

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API Server with JWT Authentication & RBAC',
    version: '3.0.0',
    endpoints: {
      auth: {
        login: 'POST /api/auth/login',
        refresh: 'POST /api/auth/refresh',
        logout: 'POST /api/auth/logout',
        profile: 'GET /api/auth/profile (protected)'
      },
      users: {
        getAll: 'GET /api/users (public)',
        create: 'POST /api/users (Moderator+)',
        update: 'PUT /api/users/:id (Owner/Admin)',
        delete: 'DELETE /api/users/:id (Admin only)'
      },
      admin: {
        getAllUsers: 'GET /api/admin/users (Admin only)',
        getUser: 'GET /api/admin/users/:id (Admin only)',
        createUser: 'POST /api/admin/users (Admin only)',
        deleteUser: 'DELETE /api/admin/users/:id (Admin only)',
        changeRole: 'PUT /api/admin/users/:id/role (Admin only)',
        getRoles: 'GET /api/admin/roles (Moderator+)'
      }
    },
    roles: {
      User: 'Basic user permissions',
      Moderator: 'Can create users and moderate content', 
      Admin: 'Full system access and user management'
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// static-server-forgot-password.js - Static server for forgot password forms
const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from current directory
app.use(express.static('.'));

// Route cho forgot password form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

// Route cho forgot password form
app.get('/forgot-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'forgot-password.html'));
});

// Route cho reset password form
app.get('/reset-password', (req, res) => {
  res.sendFile(path.join(__dirname, 'reset-password-new.html'));
});

// Route cho demo/test pages
app.get('/demo', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-forgot-password.html'));
});

app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'test-forgot-password.html'));
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Forgot Password Static Server is running',
    timestamp: new Date().toISOString(),
    routes: {
      home: 'GET /',
      forgotPassword: 'GET /forgot-password',
      resetPassword: 'GET /reset-password?token=xxx',
      demo: 'GET /demo',
      test: 'GET /test'
    }
  });
});

app.listen(PORT, () => {
  console.log(`🌐 Forgot Password Static Server running on http://localhost:${PORT}`);
  console.log(`📄 Routes available:`);
  console.log(`   GET  / - Forgot Password Form`);
  console.log(`   GET  /forgot-password - Forgot Password Form`);
  console.log(`   GET  /reset-password?token=xxx - Reset Password Form`);
  console.log(`   GET  /demo - Demo/Test Page`);
  console.log(`   GET  /test - Test Page`);
  console.log(`\n🔗 Quick Access:`);
  console.log(`   Forgot Password: http://localhost:${PORT}/forgot-password`);
  console.log(`   Demo Page: http://localhost:${PORT}/demo`);
});

module.exports = app;
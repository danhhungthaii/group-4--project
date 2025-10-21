const express = require('express');
const path = require('path');

const app = express();
const PORT = 8080;

// Serve static files from current directory
app.use(express.static('.'));

// Serve demo page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-avatar-upload.html'));
});

// Explicit route for demo page
app.get('/demo-avatar-upload.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'demo-avatar-upload.html'));
});

app.listen(PORT, () => {
  console.log(`🌐 Static Server running on http://localhost:${PORT}`);
  console.log(`📄 Demo page: http://localhost:${PORT}/demo-avatar-upload.html`);
  console.log(`🧪 Test page: http://localhost:${PORT}/test-avatar-upload.html`);
});

module.exports = app;
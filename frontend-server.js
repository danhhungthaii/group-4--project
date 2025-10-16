const express = require('express');
const path = require('path');

const app = express();
const PORT = 3001;

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));

// Route for profile management
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'profile-management.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'profile-management.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'admin-panel.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🌐 Frontend Server running at http://localhost:${PORT}`);
    console.log(`📄 Profile Management: http://localhost:${PORT}/profile`);
    console.log(`🔗 API Server: http://localhost:3000`);
});

module.exports = app;
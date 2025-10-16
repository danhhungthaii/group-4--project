const express = require('express');
const path = require('path');

const app = express();

// Serve static files
app.use(express.static(path.join(__dirname)));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🌐 Static server running at http://localhost:${PORT}`);
  console.log(`📄 Demo available at: http://localhost:${PORT}/demo-refresh-token.html`);
});
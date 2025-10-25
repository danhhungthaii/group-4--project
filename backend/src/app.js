require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Thêm dòng này
const userRoutes = require('../routes/user');
const authRoutes = require('../routes/auth');
const profileRoutes = require('../routes/profile');
const advancedRoutes = require('../routes/advanced');
const logRoutes = require('../routes/logs');
const { generalRateLimit } = require('../middleware/rateLimiter');

const app = express();
app.use(cors());
app.use(express.json());

// Error handling for JSON parsing
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ message: 'Invalid JSON format' });
  }
  next(error);
});

// Apply general rate limiting to all routes
app.use(generalRateLimit);

// Kết nối MongoDB Atlas
mongoose.connect('mongodb+srv://danhhungthao_db_user:u9PaNiwyAVyquN3a@cluster0.wu9qtho.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Kết nối MongoDB Atlas thành công!'))
.catch((err) => console.error('Lỗi kết nối MongoDB:', err));

app.use('/api', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/advanced', advancedRoutes);
app.use('/api/logs', logRoutes);
app.get('/', (req, res) => {
  res.send('API đang chạy!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

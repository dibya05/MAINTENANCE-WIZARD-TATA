// 1. Import our packages
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// 2. Load the variables from the .env file into our app
dotenv.config();

// Import our custom route files
const authRoutes = require('./routes/authRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const aiRoutes = require('./routes/aiRoutes');

// 3. Create our Express app
const app = express();

// 4. Setup Middleware
app.use(cors({
  origin: true, // Automatically reflect the request origin to allow all domains
  credentials: true,
}));

app.use(express.json({ limit: '10mb' })); // Understand incoming JSON data

// 5. Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Successfully connected to MongoDB!'))
  .catch((error) => console.log('❌ Error connecting to MongoDB:', error.message));

// 6. Hook up our APIs (Routes)
app.use('/api/auth', authRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/ai', aiRoutes);

// Health-check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Maintenance Wizard Backend is running!',
    timestamp: new Date().toISOString(),
  });
});

// --- Global Error Handler ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
});

// --- 404 Route Not Found ---
app.use((req, res, next) => {
  res.status(404).json({ message: `Route not found — ${req.originalUrl}` });
});

// 7. Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});

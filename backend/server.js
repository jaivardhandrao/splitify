const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
require('dotenv').config(); // Load env vars
dotenv.config();  // Loads .env file

const app = express();
// CORS configuration - allow local development and production URLs
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'http://localhost:5174',
    process.env.BACKEND_URL,
    process.env.FRONTEND_URL,
<<<<<<< HEAD
    'https://splitify-pi.vercel.app',
    'https://splitify.jaivardhandrao.in'
  ],
  credentials: true
}));
app.use(express.json());  // Parses JSON bodies

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Your routes (from earlier)
app.get('/api/health', (req, res) => res.json({ status: 'healthy' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/expenses', require('./routes/expenses'));

// Test route
app.get('/', (req, res) => res.send('Backend is running!'));

const PORT = process.env.PORT || 5666;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
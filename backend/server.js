const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();  // Loads .env file

const app = express();
app.use(cors({ origin: [process.env.FRONTEND_URL, 'https://splitify-pi.vercel.app/' ,  'https://splitify-pi.vercel.app' , 'http://localhost:5173', 'https://splitify-backend-ymcm.onrender.com/'] }));
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
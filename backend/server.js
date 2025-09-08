const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();  // Loads .env file

const app = express();
app.use(cors());  // Allows frontend requests
app.use(express.json());  // Parses JSON bodies

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas successfully!'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Your routes (from earlier)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/groups', require('./routes/groups'));
app.use('/api/expenses', require('./routes/expenses'));

// Test route
app.get('/', (req, res) => res.send('Backend is running!'));

app.get('/test-email', async (req, res) => {
    try {
      const transporter = require('nodemailer').createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
      });
      await transporter.sendMail({
        to: 'a@gmail.com',  // Test to yourself
        subject: 'subject mail',
        text: 'test mail',
      });
      res.send('Email sent!');
    } catch (err) {
      res.send('Error: ' + err.message);
    }
  });

const PORT = process.env.PORT || 5666;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
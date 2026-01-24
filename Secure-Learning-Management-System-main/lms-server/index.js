const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded resources
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/admin', require('./routes/admin'));

// MongoDB connection
const PORT = process.env.PORT || 5000;
let MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms';

// Add connection parameters for MongoDB Atlas
if (MONGO_URI.includes('mongodb+srv://')) {
  const separator = MONGO_URI.includes('?') ? '&' : '?';
  MONGO_URI += `${separator}retryWrites=true&w=majority`;
}

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    console.log('Please check your MongoDB connection string and network connection');
  }); 
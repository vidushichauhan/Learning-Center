const express = require('express');
const cors = require('cors'); // Import CORS to handle cross-origin requests
const apiRoutes = require('./routes/api'); // Import API routes

const app = express();
const PORT = 4000;

app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies

app.use('/api', apiRoutes); // Mount API routes
// backend/app.js

const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/learning-center')
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));



app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

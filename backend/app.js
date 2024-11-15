const express = require('express');
const cors = require('cors'); // Import CORS to handle cross-origin requests
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const apiRoutes = require('./routes/api'); // Import API routes
const apiProgressRoutes = require('./routes/UserProgressApi');
const orderRoutes = require('./routes/orderRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Enable CORS
// Increase the payload limit
app.use(express.json({ limit: '50mb' })); // Set JSON body size limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Set URL-encoded body size limit

// Route handlers
app.use('/api', apiRoutes); // Mount API routes
app.use('/apiProgress', apiProgressRoutes); // Mount progress routes
app.use('/api/orders', orderRoutes); // Mount order routes

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/learning-center', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Health check endpoint (Optional)
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is running', uptime: process.uptime() });
});

// Global error handler (Optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Payload too large. Please reduce the size of the request.' });
  } else {
    res.status(500).json({ error: 'Something went wrong!' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors'); // Import CORS to handle cross-origin requests
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const apiRoutes = require('./routes/api'); // Import general API routes
const readMeRoutes = require('./routes/ReadMe'); // Import ReadMe routes
const apiProgressRoutes = require('./routes/UserProgressApi'); // Import progress routes
const orderRoutes = require('./routes/orderRoutes'); // Import order routes
const courseRoutes = require('./pages/api/getCourseByName.js');
// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Enable CORS for all origins
app.use(express.json({ limit: '50mb' })); // Set JSON body size limit
app.use(express.urlencoded({ limit: '50mb', extended: true })); // Set URL-encoded body size limit

// Route handlers
app.use('/api', apiRoutes); // Mount general API routes
app.use('/readme', readMeRoutes); // Mount ReadMe routes under /api/readme
app.use('/apiProgress', apiProgressRoutes); // Mount progress routes under /apiProgress
app.use('/api/orders', orderRoutes); // Mount order routes under /api/orders
app.use('/course',courseRoutes);

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

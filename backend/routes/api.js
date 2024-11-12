require('dotenv').config(); // Load environment variables
const express = require('express');
const axios = require('axios'); // Axios for HTTP requests
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcrypt'); // For password hashing
const multer = require('multer'); 
const upload = multer(); // Multer for handling file uploads

// Helper function to configure GitHub API requests with token
const getGitHubConfig = () => ({
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`, // Use the token from environment variable
  },
});

// Fetch GitHub repositories
router.get('/repos', async (req, res) => {
  const url = `https://api.github.com/users/LearningCenter-web/repos?per_page=100`;
  try {
    const response = await axios.get(url, getGitHubConfig());
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories.' });
  }
});

// Fetch README.md from a repository
router.get('/readme/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;

  try {
    const response = await axios.get(url, getGitHubConfig());
    res.status(200).send(response.data); // Send README.md content as plain text
  } catch (error) {
    console.error('Error fetching README.md:', error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'README.md not found.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch README.md content.' });
    }
  }
});

// Add this to the /repos/:repoName/contents route in backend/routes/api.js
router.get('/repos/:repoName/contents/image', async (req, res) => {
  const { repoName } = req.params;
  const url = `https://api.github.com/repos/LearningCenter-web/${repoName}/contents/image`;

  try {
    const response = await axios.get(url, getGitHubConfig());
    const imageFile = response.data.find(
      (file) => file.type === 'file' && (file.name === 'image.png' || file.name === 'download.png')
    );

    if (imageFile) {
      res.status(200).json({ imageUrl: imageFile.download_url });
    } else {
      res.status(404).json({ error: 'No image found in image folder' });
    }
  } catch (error) {
    console.error('Error fetching course image:', error.message);
    res.status(500).json({ error: 'Failed to fetch course image' });
  }
});


// Fetch folder structure from GitHub repository
router.get('/repos/:repoName/contents', async (req, res) => {
  const { repoName } = req.params;
  const url = `https://api.github.com/repos/LearningCenter-web/${repoName}/contents`;

  try {
    const response = await axios.get(url, getGitHubConfig());
    res.status(200).json(response.data); // Send folder structure as JSON
  } catch (error) {
    console.error('Error fetching repository contents:', error.message);
    res.status(500).json({ error: 'Failed to fetch repository contents.' });
  }
});

// Fetch contents of a specific path in a repository
router.get('/repos/:repoName/contents/*', async (req, res) => {
  const { repoName } = req.params;
  const path = req.params[0]; // Capture the full path after /contents/
  const url = `https://api.github.com/repos/LearningCenter-web/${repoName}/contents/${encodeURIComponent(path)}`;

  try {
    const response = await axios.get(url, getGitHubConfig());
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching path contents:', error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'Folder or file not found.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch folder contents.' });
    }
  }
});

// Sign-Up Route
router.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in signup:', error.message);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Sign-In Route
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    res.status(200).json({
      message: 'Sign in successful',
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error during sign-in:', error.message);
    res.status(500).json({ error: 'Server error during sign-in' });
  }
});

const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

// Add Course to Cart Route
// backend/routes/orderRoutes.js

router.post('/add-to-cart', async (req, res) => {
  try {
    const { userId, courseId, courseName } = req.body;

    let order = await Order.findOne({ userId });

    if (order) {
      // Check if the course is already in the cart
      const existingCourse = order.courses.find(
        (course) => course.courseId.toString() === courseId
      );

      if (existingCourse) {
        // If the course is already in the cart, increase the quantity
        existingCourse.quantity += 1;
      } else {
        // If the course is not in the cart, add it with quantity 1
        order.courses.push({ courseId, courseName, quantity: 1 });
      }
    } else {
      // Create a new order with the course if the order does not exist
      order = new Order({
        userId,
        username: req.body.username,
        courses: [{ courseId, courseName, quantity: 1 }],
      });
    }

    await order.save();
    res.status(200).json({ message: 'Course added to cart successfully' });
  } catch (error) {
    console.error('Error adding course to cart:', error);
    res.status(500).json({ error: 'Failed to add course to cart' });
  }
});



// Create a folder by adding an empty file in the specified directory
// Create a folder by adding an empty file in the specified directory
router.post('/create-folder', async (req, res) => {
  const { repoName, folderPath } = req.body;

  if (!repoName || !folderPath) {
    return res.status(400).json({ error: 'Repository name and folder path are required' });
  }

  const url = `https://api.github.com/repos/LearningCenter-web/${repoName}/contents/${encodeURIComponent(folderPath)}/.keep`; // .keep file to represent folder
  const message = `Create folder ${folderPath}`;
  console.log(`Attempting to create folder at: ${url}`);

  try {
    const response = await axios.put(
      url,
      {
        message: message,
        content: Buffer.from('').toString('base64'), // Empty file content
      },
      getGitHubConfig()
    );

    res.status(200).json({ message: 'Folder created successfully', data: response.data });
  } catch (error) {
    console.error('Error creating folder:', error.message);
    if (error.response) {
      console.error('Full error response:', error.response.data); // Log the full error response
      console.error('Attempted URL:', url); // Log the URL to confirm the exact endpoint
      console.error('GitHub token:', process.env.GITHUB_TOKEN ? 'Token provided' : 'No token provided');
    }
    res.status(500).json({ error: 'Failed to create folder', details: error.response ? error.response.data : null });
  }
});



// Upload a file to a specified folder
router.post('/upload-file', upload.single('file'), async (req, res) => {
  const { courseName, folderPath } = req.body; // Get courseName and folderPath from the request body
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  const fileContent = file.buffer.toString('base64'); // Convert file to base64

  try {
    // Make a request to GitHub to upload the file
    const response = await axios.put(
      `https://api.github.com/repos/LearningCenter-web/${courseName}/contents/${folderPath}/${file.originalname}`,
      {
        message: `Upload file ${file.originalname}`,
        content: fileContent,
      },
      getGitHubConfig()
    );

    res.status(200).json({ message: 'File uploaded successfully' });
  } catch (error) {
    console.error('Error uploading file:', error.message);
    res.status(500).json({ error: 'Failed to upload file to GitHub' });
  }
});


// Update course quantity
router.post('/update-quantity', async (req, res) => {
  const { userId, courseId, quantity } = req.body;
  try {
    const order = await Order.findOne({ userId });
    if (order) {
      const course = order.courses.find(c => c.courseId.toString() === courseId);
      if (course) {
        course.quantity = quantity;
        await order.save();
        return res.status(200).json({ message: 'Quantity updated successfully' });
      }
    }
    res.status(404).json({ error: 'Course not found in order' });
  } catch (error) {
    console.error('Error updating quantity:', error);
    res.status(500).json({ error: 'Failed to update quantity' });
  }
});

// Remove course from cart
router.delete('/remove', async (req, res) => {
  const { userId, courseId } = req.body;
  try {
    const order = await Order.findOneAndUpdate(
      { userId },
      { $pull: { courses: { courseId } } },
      { new: true }
    );
    if (order) {
      return res.status(200).json({ message: 'Course removed successfully' });
    }
    res.status(404).json({ error: 'Order not found' });
  } catch (error) {
    console.error('Error removing course:', error);
    res.status(500).json({ error: 'Failed to remove course from cart' });
  }
});



module.exports = router;

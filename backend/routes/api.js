require('dotenv').config(); // Load environment variables
const express = require('express');
const axios = require('axios'); // Axios for HTTP requests
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcrypt'); // For password hashing

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

// Add Course to Cart
router.post('/add-to-cart', async (req, res) => {
  try {
    const { userId, username, courseId, courseName } = req.body;

    let order = await Order.findOne({ userId });

    if (order) {
      order.courses.push({ courseId, courseName });
    } else {
      order = new Order({
        userId,
        username,
        courses: [{ courseId, courseName }],
      });
    }

    await order.save();
    res.status(200).json({ message: 'Course added to cart successfully' });
  } catch (error) {
    console.error('Error adding course to cart:', error.message);
    res.status(500).json({ error: 'Failed to add course to cart' });
  }
});

module.exports = router;

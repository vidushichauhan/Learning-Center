const express = require('express');
const axios = require('axios'); // Axios to fetch external data
const router = express.Router();
// backend/routes/api.js
const User = require('../models/User'); // Adjust path as necessary
const bcrypt = require('bcrypt'); // Add this line to import bcrypt


// Fetch GitHub repositories
router.get('/repos', async (req, res) => {
  const url = `https://api.github.com/users/LearningCenter-web/repos?per_page=100`;

  try {
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories.' });
  }
});

// Fetch README.md from a repository
router.get('/readme/:owner/:repo', async (req, res) => {
  const { owner, repo } = req.params;
  console.log(repo);
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;

  try {
    const response = await axios.get(url);
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

router.get('/repos/:repoName/contents/*', async (req, res) => {
  const { repoName } = req.params;
  const path = req.params[0]; // Capture the full path after /contents/
  const url = `https://api.github.com/repos/LearningCenter-web/${repoName}/contents/${encodeURIComponent(path)}`;

  try {
    const response = await axios.get(url);
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

// Fetch folder structure from GitHub repository
router.get('/repos/:repoName/contents', async (req, res) => {
  const { repoName } = req.params;
  const url = `https://api.github.com/repos/LearningCenter-web/${repoName}/contents`;

  try {
    const response = await axios.get(url);
    const contents = response.data;
    res.status(200).json(contents); // Send folder structure as JSON
  } catch (error) {
    console.error('Error fetching repository contents:', error.message);
    res.status(500).json({ error: 'Failed to fetch repository contents.' });
  }
});


// Fetch contents of a specific path in a repository
router.get('/repos/:repoName/contents/:path', async (req, res) => {
  const { repoName, path } = req.params;
  const url = `https://api.github.com/repos/LearningCenter-web/${repoName}/contents/${path}`;

  try {
    const response = await axios.get(url);
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching path contents:', error.message);
    res.status(500).json({ error: 'Failed to fetch path contents.' });
  }
});

// routes/api.js

router.post('/signup', async (req, res) => {
  const { username, email, password, role } = req.body; // Get role from the request

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role, // Store role in the user document
    });

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

    // Return the username and role on successful login
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


module.exports = router;

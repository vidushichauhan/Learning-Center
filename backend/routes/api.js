require('dotenv').config(); // Load environment variables
const express = require('express');
const axios = require('axios');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const bcrypt = require('bcrypt');
const multer = require('multer');
const upload = multer(); // Multer for handling file uploads

// Helper function to configure GitHub API requests with token
const getGitHubConfig = () => ({
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`, // Use the token from environment variable
  },
});

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


// Fetch GitHub repositories dynamically
router.get('/repos', async (req, res) => {
  const url = `https://api.github.com/users/${process.env.GITHUB_USER}/repos?per_page=100`;
  try {
    const response = await axios.get(url, getGitHubConfig());
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching repositories:', error.message);
    res.status(500).json({ error: 'Failed to fetch repositories.' });
  }
});

// Fetch README.md from a repository dynamically
router.get('/readme/:repoName', async (req, res) => {
  const { repoName } = req.params;
  const url = `https://api.github.com/repos/${process.env.GITHUB_USER}/${repoName}/contents/README.md`;

  try {
    const response = await axios.get(url, getGitHubConfig());
    res.status(200).json(response.data); // Return README.md content
  } catch (error) {
    console.error('Error fetching README.md:', error.message);
    res.status(500).json({ error: 'Failed to fetch README.md.' });
  }
});

// Fetch folder structure from GitHub repository dynamically
router.get('/repos/:repoName/contents/:path?', async (req, res) => {
  const { repoName, path } = req.params;
  const folderPath = path || ''; // Default to root folder if no path provided
  const url = `https://api.github.com/repos/${process.env.GITHUB_USER}/${repoName}/contents/${folderPath}`;

  try {
    const response = await axios.get(url, getGitHubConfig());
    res.status(200).json(response.data); // Send folder contents as JSON
  } catch (error) {
    console.error('Error fetching repository contents:', error.message);
    res.status(500).json({ error: 'Failed to fetch repository contents.' });
  }
});

// Fetch images from the "image" folder dynamically
router.get('/repos/:repoName/contents/image', async (req, res) => {
  const { repoName } = req.params;
  const url = `https://api.github.com/repos/${process.env.GITHUB_USER}/${repoName}/contents/image`;

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

router.post("/handle-file", upload.single("file"), async (req, res) => {
  const { repoName, folderPath } = req.body;
  const file = req.file;

  if (!repoName || !folderPath || !file) {
    return res.status(400).json({
      error: "Repository name, folder path, and file are required.",
    });
  }

  const folderUrl = `https://api.github.com/repos/${process.env.GITHUB_USER}/${repoName}/contents/${encodeURIComponent(
    folderPath
  )}`;
  const fileUrl = `https://api.github.com/repos/${process.env.GITHUB_USER}/${repoName}/contents/${encodeURIComponent(
    folderPath
  )}/${file.originalname}`;

  try {
    // Step 1: Check if folder exists
    let folderExists = true;
    try {
      await axios.get(folderUrl, getGitHubConfig());
    } catch (error) {
      if (error.response && error.response.status === 404) {
        folderExists = false;
      } else {
        throw error; // Propagate unexpected errors
      }
    }

    // Step 2: Create folder if it doesn't exist
    if (!folderExists) {
      const folderCreationResponse = await axios.put(
        `${folderUrl}/.keep`, // Create an empty .keep file
        {
          message: `Create folder ${folderPath}`,
          content: Buffer.from("").toString("base64"),
        },
        getGitHubConfig()
      );
      console.log("Folder created:", folderCreationResponse.data);
    }

    // Step 3: Upload the file
    const fileUploadResponse = await axios.put(
      fileUrl,
      {
        message: `Upload file ${file.originalname}`,
        content: file.buffer.toString("base64"),
      },
      getGitHubConfig()
    );

    res.status(200).json({
      message: "File uploaded successfully!",
      data: fileUploadResponse.data,
    });
  } catch (error) {
    console.error("Error handling file:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.message || "Failed to handle file.",
    });
  }
});

// Add course to cart route
router.post('/add-to-cart', async (req, res) => {
  try {
    const { userId, courseId, courseName } = req.body;

    let order = await Order.findOne({ userId });

    if (order) {
      const existingCourse = order.courses.find(
        (course) => course.courseId.toString() === courseId
      );

      if (existingCourse) {
        existingCourse.quantity += 1;
      } else {
        order.courses.push({ courseId, courseName, quantity: 1 });
      }
    } else {
      order = new Order({
        userId,
        username: req.body.username,
        courses: [{ courseId, courseName, quantity: 1 }],
      });
    }

    await order.save();
    res.status(200).json({ message: 'Course added to cart successfully' });
  } catch (error) {
    console.error('Error adding course to cart:', error.message);
    res.status(500).json({ error: 'Failed to add course to cart.' });
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
    console.error('Error removing course:', error.message);
    res.status(500).json({ error: 'Failed to remove course from cart.' });
  }
});

// Fetch raw content of a file
router.get('/repos/:repoName/raw/*', async (req, res) => {
  const { repoName } = req.params;
  const path = req.params[0]; // Full path after /raw/
  const url = `https://raw.githubusercontent.com/LearningCenter-web/${repoName}/main/${path}`;

  try {
    const response = await axios.get(url);
    res.status(200).send(response.data); // Send the raw file content
  } catch (error) {
    console.error('Error fetching raw file content:', error.message);
    if (error.response && error.response.status === 404) {
      res.status(404).json({ error: 'File not found.' });
    } else {
      res.status(500).json({ error: 'Failed to fetch raw file content.' });
    }
  }
});

router.get('/proxy/readme', async (req, res) => {
  const { repoName, path } = req.query;
  const url = `https://raw.githubusercontent.com/LearningCenter-web/${repoName}/main/${path}`;

  try {
    const response = await axios.get(url);
    res.status(200).send(response.data);
  } catch (error) {
    console.error('Error fetching README.md:', error.message);
    res.status(500).json({ error: 'Failed to fetch README.md content.' });
  }
});


module.exports = router;

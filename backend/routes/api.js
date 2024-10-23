const express = require('express');
const axios = require('axios'); // Axios to fetch external data
const router = express.Router();

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

module.exports = router;

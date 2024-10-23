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


module.exports = router;

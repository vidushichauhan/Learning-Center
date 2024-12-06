// backend/routes/api.js
const express = require('express');
const router = express.Router();


router.get('/', async (req, res) => {
  const { repoName } = req.query;

  if (!repoName) {
    return res.status(400).json({ error: 'Repository name is required' });
  }

  const url = `https://api.github.com/repos/${process.env.GITHUB_USER}/${repoName}/contents`;

  try {
    // Fetch repository contents
    const response = await axios.get(url, getGitHubConfig());
    const data = response.data;

    // Parse and filter the response if needed
    const filteredData = data.map((item) => ({
      name: item.name,
      path: item.path,
      type: item.type,
      download_url: item.download_url,
    }));

    res.status(200).json(filteredData);
  } catch (error) {
    console.error('Error fetching course data:', error.message);

    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data.message || 'Failed to fetch course data',
      });
    }

    res.status(500).json({ error: 'Server error while fetching course data' });
  }
});

module.exports = router;

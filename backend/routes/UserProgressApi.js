const express = require('express');
const UserProgress = require('../models/UserProgress');
const router = express.Router();

router.post('/progress', async (req, res) => {
  const { userId, courseId, completedModules } = req.body;

  try {
    let progress = await UserProgress.findOne({ userId, courseId });

    if (progress) {
      progress.completedModules = completedModules;
    } else {
      progress = new UserProgress({ userId, courseId, completedModules });
    }

    await progress.save();
    res.status(200).json({ message: 'Progress updated successfully', progress });
  } catch (error) {
    console.error('Error saving progress:', error.message);
    res.status(500).json({ error: 'Failed to save progress.' });
  }
});

router.get('/progress/:userId/:courseId', async (req, res) => {
  const { userId, courseId } = req.params;

  try {
    const progress = await UserProgress.findOne({ userId, courseId });

    if (!progress) {
      return res.status(404).json({ message: 'No progress found for this user and course.' });
    }

    res.status(200).json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error.message);
    res.status(500).json({ error: 'Failed to fetch progress.' });
  }
});

module.exports = router;

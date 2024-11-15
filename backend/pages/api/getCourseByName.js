// backend/routes/api.js
const express = require('express');
const router = express.Router();
const Course = require('../models/Course');

router.get('/getCourseByName', async (req, res) => {
  const { courseName } = req.query;

  try {
    const course = await Course.findOne({ title: courseName });
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(200).json(course);
  } catch (error) {
    console.error('Error fetching course:', error.message);
    res.status(500).json({ error: 'Failed to fetch course' });
  }
});

module.exports = router;

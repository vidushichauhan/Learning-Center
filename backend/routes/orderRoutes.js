const express = require('express');
const router = express.Router();

// Example route for adding to cart
router.post('/add-to-cart', async (req, res) => {
  try {
    // Add your logic here to handle adding a course to the cart
    res.status(200).json({ message: 'Course added to cart successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add course to cart' });
  }
});

module.exports = router;

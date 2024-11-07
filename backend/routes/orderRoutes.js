// backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/add-to-cart', async (req, res) => {
  try {
    const { userId, username, courseId, courseName } = req.body;

    // Check if an order exists for the user
    let order = await Order.findOne({ userId });

    if (order) {
      // Add the course if it's not already in the cart
      if (!order.courses.some(course => course.courseId.toString() === courseId)) {
        order.courses.push({ courseId, courseName });
        await order.save();
      }
    } else {
      // Create a new order with the course
      order = new Order({
        userId,
        username,
        courses: [{ courseId, courseName }],
      });
      await order.save();
    }

    res.status(200).json({ message: 'Course added to cart successfully' });
  } catch (error) {
    console.error('Error adding course to cart:', error);
    res.status(500).json({ error: 'Failed to add course to cart' });
  }
});

module.exports = router;

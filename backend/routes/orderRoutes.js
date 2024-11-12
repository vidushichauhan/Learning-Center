// backend/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.post('/add-to-cart', async (req, res) => {
  try {
    const { userId, username, courseId, courseName } = req.body;

    let order = await Order.findOne({ userId });

    if (order) {
      // Check if the course is already in the cart
      if (!order.courses.some(course => course.courseId === String(courseId))) {
        order.courses.push({ courseId: String(courseId), courseName }); // Convert to String
        await order.save();
      }
    } else {
      // Create a new order with the course
      order = new Order({
        userId,
        username,
        courses: [{ courseId: String(courseId), courseName }], // Convert to String
      });
      await order.save();
    }

    res.status(200).json({ message: 'Course added to cart successfully' });
  } catch (error) {
    console.error('Error adding course to cart:', error.message);
    res.status(500).json({ error: 'Failed to add course to cart' });
  }
});

// backend/routes/orderRoutes.js

router.get('/cart/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const order = await Order.findOne({ userId }).populate('courses.courseId'); // Use populate if courseId references another model

    if (!order) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.status(200).json(order.courses);
  } catch (error) {
    console.error('Error fetching cart items:', error.message);
    res.status(500).json({ error: 'Failed to fetch cart items' });
  }
});


module.exports = router;

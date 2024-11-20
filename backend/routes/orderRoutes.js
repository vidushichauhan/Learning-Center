const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Order, orderSchema } = require('../models/Order'); // Import both Order model and orderSchema

// Route to add a course to the cart
router.post('/add-to-cart', async (req, res) => {
  try {
    const { userId, username, courseId, courseName } = req.body;

    let order = await Order.findOne({ userId });

    if (order) {
      // Check if the course is already in the cart
      if (!order.courses.some((course) => course.courseId === String(courseId))) {
        order.courses.push({ courseId: String(courseId), courseName }); // Add course
        await order.save();
      }
    } else {
      // Create a new order with the course
      order = new Order({
        userId,
        username,
        courses: [{ courseId: String(courseId), courseName }],
      });
      await order.save();
    }

    res.status(200).json({ message: 'Course added to cart successfully' });
  } catch (error) {
    console.error('Error adding course to cart:', error.message);
    res.status(500).json({ error: 'Failed to add course to cart' });
  }
});

// Route to fetch cart items
router.get('/cart/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const order = await Order.findOne({ userId });

    if (!order) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.status(200).json(order.courses);
  } catch (error) {
    console.error('Error fetching cart items:', error.message);
    res.status(500).json({ error: ' ' });
  }
});

// Route to remove a course from the cart
router.delete('/remove', async (req, res) => {
  const { userId, courseId } = req.body;

  try {
    const order = await Order.findOneAndUpdate(
      { userId },
      { $pull: { courses: { courseId } } }, // Remove the course
      { new: true } // Return the updated document
    );

    if (order) {
      return res.status(200).json({ message: 'Course removed successfully', courses: order.courses });
    }

    res.status(404).json({ error: 'Order not found' });
  } catch (error) {
    console.error('Error removing course:', error.message);
    res.status(500).json({ error: 'Failed to remove course from cart' });
  }
});

// Route to handle checkout
router.post('/checkout', async (req, res) => {
  const { userId } = req.body;

  try {
    // Find the user's cart
    const order = await Order.findOne({ userId });

    if (!order || order.courses.length === 0) {
      return res.status(400).json({ error: 'Cart is empty or does not exist.' });
    }

    // Create a new collection for completed orders
    const OrderedClasses = mongoose.model('OrderedClasses', orderSchema); // Reuse the schema for new collection
    await OrderedClasses.create({
      userId: order.userId,
      username: order.username,
      courses: order.courses, // Move courses to the new collection
      status: 'completed',
    });

    // Remove the user's cart after checkout
    await Order.findOneAndDelete({ userId });

    res.status(200).json({ message: 'Checkout completed successfully.' });
  } catch (error) {
    console.error('Error during checkout:', error.message);
    res.status(500).json({ error: 'Failed to complete checkout.' });
  }
});

// Route to fetch purchased courses
router.get('/purchased/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const OrderedClasses = mongoose.model('OrderedClasses', orderSchema); // Use the same schema
    const userOrders = await OrderedClasses.find({ userId }).sort({ createdAt: -1 });

    if (userOrders.length === 0) {
      return res.status(404).json({ message: 'No purchased courses found' });
    }

    const courses = userOrders.map((order) => {
      return order.courses.map((course) => ({
        courseId: course.courseId,
        courseName: course.courseName,
        purchasedAt: order.createdAt,
      }));
    });

    // Flatten the array of arrays
    const purchasedCourses = [].concat(...courses);

    res.status(200).json(purchasedCourses);
  } catch (error) {
    console.error('Error fetching purchased courses:', error.message);
    res.status(500).json({ error: 'Failed to fetch purchased courses' });
  }
});

module.exports = router;

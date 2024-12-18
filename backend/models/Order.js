const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    courses: [
      {
        courseId: {
          type: String,
          required: true,
        },
        courseName: {
          type: String,
          required: true,
        },
        tutorName: {
          type: String,
        },
        price: {
          type: Number,
        },
      },
    ],
    status: {
      type: String,
      enum: ['completed', 'pending', 'canceled'],
      default: 'completed',
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Add index for faster queries
orderSchema.index({ userId: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = { Order, orderSchema }; // Export both the model and schema

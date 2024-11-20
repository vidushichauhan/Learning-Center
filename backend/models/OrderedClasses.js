const mongoose = require('mongoose');

const orderedClassSchema = new mongoose.Schema(
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
      enum: ['completed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('OrderedClass', orderedClassSchema);

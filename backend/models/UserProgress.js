const mongoose = require('mongoose');

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  courseId: {
    type: String, // Change this to String if it's not an ObjectId
    required: true,
  },
  completedModules: [String], // Array of completed module IDs or names
});

module.exports = mongoose.model('UserProgress', userProgressSchema);

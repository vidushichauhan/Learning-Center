const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  modules: [
    {
      title: { type: String, required: true },
      type: { type: String, enum: ['video', 'text'], required: true }, // 'video' or 'text'
      content: String, // Video URL or text content
      duration: String, // Duration for videos
    },
  ],
});

module.exports = mongoose.model('Course', courseSchema);

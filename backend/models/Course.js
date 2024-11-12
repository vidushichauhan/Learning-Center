const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  modules: [
    {
      title: String,
      type: { type: String, enum: ['video', 'text'] }, // 'video' or 'text'
      content: String, // Video URL or text content
      duration: String, // Duration for videos
    },
  ],
});

module.exports = mongoose.model('Course', courseSchema);

const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
  modules: [
    {
      title: { type: String, required: true },
      type: { type: String, enum: ["video", "text"], required: true }, // 'video' or 'text'
      content: String, // Video URL or text content
      duration: String, // Duration for videos (optional)
    },
  ],
  image: {
    type: String, // URL of the course image
    default: "",
  },
});

module.exports = mongoose.model("Class", classSchema);

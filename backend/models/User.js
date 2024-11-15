const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['student', 'teacher'] },
  profileImage: { type: String, default: null }, // Field for storing Base64 string or image URL
});

module.exports = mongoose.model('User', userSchema);

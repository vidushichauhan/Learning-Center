const userProgressSchema = new mongoose.Schema({
    userId: mongoose.Schema.Types.ObjectId,
    courseId: mongoose.Schema.Types.ObjectId,
    completedModules: [String], // List of completed module titles
  });
  
  module.exports = mongoose.model('UserProgress', userProgressSchema);
  
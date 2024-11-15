const express = require("express");
const router = express.Router();
const Class = require("../models/Class");
const axios = require("axios");

// Fetch all classes from MongoDB
router.get("/", async (req, res) => {
  try {
    const classes = await Class.find();
    res.status(200).json(classes);
  } catch (error) {
    console.error("Error fetching classes:", error.message);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// Fetch a single class by title (repoName)
router.get("/:title", async (req, res) => {
  const { title } = req.params;

  try {
    const classData = await Class.findOne({ title });
    if (!classData) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.status(200).json(classData);
  } catch (error) {
    console.error("Error fetching class:", error.message);
    res.status(500).json({ error: "Failed to fetch class" });
  }
});

// Sync classes from GitHub repositories to MongoDB
router.post("/sync", async (req, res) => {
  const GITHUB_USER = process.env.GITHUB_USER;

  try {
    const response = await axios.get(
      `https://api.github.com/users/${GITHUB_USER}/repos`
    );
    const repos = response.data;

    const classes = repos.map((repo) => ({
      title: repo.name,
      description: repo.description || "",
      modules: [], // Optionally fetch modules later
      image: "", // You can fetch and assign an image if available
    }));

    await Class.insertMany(classes, { ordered: false }); // Ignore duplicate keys
    res.status(200).json({ message: "Classes synced successfully" });
  } catch (error) {
    console.error("Error syncing classes:", error.message);
    res.status(500).json({ error: "Failed to sync classes" });
  }
});

// Add a new class manually
router.post("/", async (req, res) => {
  const { title, description, modules, image } = req.body;

  try {
    const newClass = new Class({ title, description, modules, image });
    await newClass.save();
    res.status(201).json(newClass);
  } catch (error) {
    console.error("Error adding class:", error.message);
    res.status(500).json({ error: "Failed to add class" });
  }
});

// Delete a class by title
router.delete("/:title", async (req, res) => {
  const { title } = req.params;

  try {
    const deletedClass = await Class.findOneAndDelete({ title });
    if (!deletedClass) {
      return res.status(404).json({ error: "Class not found" });
    }
    res.status(200).json({ message: "Class deleted successfully" });
  } catch (error) {
    console.error("Error deleting class:", error.message);
    res.status(500).json({ error: "Failed to delete class" });
  }
});

module.exports = router;

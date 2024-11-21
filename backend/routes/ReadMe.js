require("dotenv").config();
const express = require("express");
const axios = require("axios");
const router = express.Router();

router.get("/:repoName", async (req, res) => {
  const { repoName } = req.params;

  try {
    const url = `https://raw.githubusercontent.com/LearningCenter-web/${repoName}/main/README.md`;

    console.log(`Fetching README.md from: ${url}`);
    const response = await axios.get(url);
    const content = response.data;

    console.log("Fetched README content:", content);

    const parseMarkdown = (section, regex) => {
      const match = section.match(regex);
      return match ? match[1].trim() : null;
    };

    // Extract course details
    const courseName = parseMarkdown(content, /# Course Name: (.+)/);
    const description = parseMarkdown(content, /\*\*Course Description:\*\* (.+)/);
    const price = parseMarkdown(content, /\*\*Course Price:\*\* \$?(.+)/);
    const teacher = parseMarkdown(content, /\*\*Teacher:\*\* (.+)/);

    res.status(200).json({
      courseName: courseName || "Unknown Course",
      description: description || "No description available.",
      teacher: teacher || "Unknown Teacher",
      price: price || "Free",
    });
  } catch (error) {
    console.error("Error fetching README.md:", error.message);
    res.status(500).json({ error: "Failed to fetch course details." });
  }
});

module.exports = router;

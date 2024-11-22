const axios = require("axios");
const express = require("express");
const router = express.Router();

router.get("/:repoName", async (req, res) => {
  const { repoName } = req.params;

  try {
    const url = `https://raw.githubusercontent.com/LearningCenter-web/${repoName}/main/README.md`;

    console.log(`Fetching README.md from: ${url}`);
    const response = await axios.get(url);
    const content = response.data;

    console.log("Fetched README content:", content);

    // Helper function to parse Markdown content
    const parseMarkdown = (content, regex) => {
      const match = content.match(regex);
      return match ? match[1].trim() : null;
    };

    // Regex patterns for extracting course details
    const courseNameRegex = /^# (.+)/; // Matches the first-level heading directly
    const descriptionRegex = /\*\*Course Description:\*\* ?(.+)/i;
    const priceRegex = /\*\*Course Price:\*\* ?\$?(.+)/i;
    const teacherRegex = /\*\*Teacher:\*\* ?(.+)/i;

    // Extract course details
    const courseName = parseMarkdown(content, courseNameRegex);
    const description = parseMarkdown(content, descriptionRegex);
    const price = parseMarkdown(content, priceRegex);
    const teacher = parseMarkdown(content, teacherRegex);

    // Respond with extracted data or default values
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

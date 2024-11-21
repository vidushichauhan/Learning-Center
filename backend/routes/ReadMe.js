require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper function for GitHub API configuration
const getGitHubConfig = () => ({
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`, // Use GitHub token for private repos
  },
});

// Helper function to parse sections (e.g., Videos, Images, Documents, PDFs)
const parseSection = (sectionContent) => {
  return sectionContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line) // Remove empty lines
    .reduce((acc, line, index, arr) => {
      const titleMatch = line.match(/\*\*(.+)\*\*/); // Extract title
      const fileNameMatch = arr[index + 1]?.match(/.+\.(\w{2,4})/); // Check the next line for a filename
      if (titleMatch) {
        acc.push({
          name: titleMatch[1].trim(),
          fileName: fileNameMatch ? fileNameMatch[0].trim() : "Unknown File",
          content: line.replace(/\*\*(.+)\*\*/, "").trim() || "No description available",
        });
      }
      return acc;
    }, []);
};

router.get("/readme-to-json/:repoName", async (req, res) => {
  const { repoName } = req.params;

  try {
    const url = `https://raw.githubusercontent.com/LearningCenter-web/${repoName}/main/README.md`;
    console.log(`Fetching README.md from: ${url}`);

    const response = await axios.get(url);
    const content = response.data;

    const parseMarkdown = (section, regex) => {
      const match = section.match(regex);
      return match ? match[1].trim() : null;
    };

    // Course details
    const courseName = parseMarkdown(content, /\*\*Course Name:\*\* (.+)/);
    const teacher = parseMarkdown(content, /\*\*Teacher:\*\* (.+)/);
    const description = parseMarkdown(content, /\*\*Description:\*\* (.+)/);
    const price = parseMarkdown(content, /\*\*Price:\*\* \$?(.+)/);

    // Videos
    const videoSection = content.match(/## Videos([\s\S]*?)##/);
    const videos = videoSection ? parseSection(videoSection[1]) : [];

    // Images
    const imageSection = content.match(/## Images([\s\S]*?)##/);
    const images = imageSection ? parseSection(imageSection[1]) : [];

    // Documents
    const documentSection = content.match(/## Documents([\s\S]*?)##/);
    const documents = documentSection ? parseSection(documentSection[1]) : [];

    // PDFs
    const pdfSection = content.match(/## PDFs([\s\S]*?)$/);
    const pdfs = pdfSection ? parseSection(pdfSection[1]) : [];

    // Modules
    const moduleSection = content.match(/## Modules([\s\S]*?)##/);
    const modules = moduleSection
      ? moduleSection[1]
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line) // Remove empty lines
          .reduce((acc, line) => {
            if (line.startsWith("###")) {
              acc.push({ name: line.replace("###", "").trim(), content: "" });
            } else if (acc.length > 0) {
              acc[acc.length - 1].content += ` ${line.trim()}`;
            }
            return acc;
          }, [])
          .map((module) => ({
            name: module.name,
            content: module.content.trim() || "No content available for this module.",
          }))
      : [];

    res.status(200).json({
      courseDetails: {
        courseName: courseName || "Unknown Course",
        teacher: teacher || "Unknown Teacher",
        description: description || "No description available",
        price: price || "Free",
      },
      videos,
      modules,
      images,
      documents,
      pdfs,
    });
  } catch (error) {
    console.error("Error fetching README.md:", error.message);
    res.status(500).json({
      error: "An error occurred while processing the request.",
    });
  }
});

module.exports = router;

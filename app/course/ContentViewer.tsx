import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

interface RepoContent {
  name: string;
  path: string;
  type: string;
  download_url: string | null;
}

interface ContentViewerProps {
  selectedModule: RepoContent | null;
  repoName: string; // To fetch course details
}

const ContentViewer: React.FC<ContentViewerProps> = ({
  selectedModule,
  repoName,
}) => {
  const [courseDetails, setCourseDetails] = useState<{
    courseName: string;
    description: string;
  }>({ courseName: "Loading...", description: "Loading..." });
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      console.log("Fetching course details for:", repoName); // Debug log
      try {
        const response = await fetch(`http://localhost:4000/readme/${repoName}`);
        console.log("API Response:", response); // Debug log
        if (response.ok) {
          const data = await response.json();
          console.log("Parsed Data:", data); // Debug log
          setCourseDetails({
            courseName: data.courseName || "Unknown Course",
            description: data.description || "No description available.",
          });
        } else {
          console.error("Failed to fetch course details.");
          setCourseDetails({
            courseName: "Unknown Course",
            description: "Failed to fetch course details.",
          });
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
        setCourseDetails({
          courseName: "Unknown Course",
          description: "An error occurred while fetching course details.",
        });
      } finally {
        setLoadingDetails(false);
      }
    };

    fetchCourseDetails();
  }, [repoName]);

  if (!selectedModule) {
    if (loadingDetails) {
      return <p className="text-gray-600">Loading course details...</p>;
    }
    return (
      <div className="w-3/4 p-6 bg-gray-100 rounded shadow-md">
        <h1 className="text-2xl font-bold text-blue-600 mb-4">
          {courseDetails.courseName}
        </h1>
        <p className="text-gray-700 text-lg">{courseDetails.description}</p>
      </div>
    );
  }

  const { name, download_url } = selectedModule;

  if (!download_url) {
    return <p className="text-gray-600">No content available for this module.</p>;
  }

  if (name.endsWith(".md")) {
    return (
      <div className="w-3/4 p-4">
        <ReactMarkdown className="bg-gray-100 p-4 rounded shadow-md">
          {`# Markdown Content Loaded from ${download_url}`}
        </ReactMarkdown>
      </div>
    );
  } else if (name.match(/\.(png|jpg|jpeg|gif)$/i)) {
    return (
      <div className="w-3/4 p-4">
        <img
          src={download_url}
          alt={name}
          className="rounded border shadow-md"
        />
      </div>
    );
  } else if (name.match(/\.(mp4|webm|ogg)$/i)) {
    return (
      <div className="w-3/4 p-4">
        <video
          controls
          style={{ height: "500px" }}
          className="w-full rounded border shadow-md"
          src={download_url}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    );
  } else if (name.match(/\.(pdf|doc|docx|html)$/i)) {
    return (
      <div className="w-3/4 p-4">
        <iframe
          src={`https://docs.google.com/gview?url=${download_url}&embedded=true`}
          className="w-full h-96 rounded border shadow-md"
          frameBorder="0"
        ></iframe>
      </div>
    );
  } else {
    return (
      <div className="w-3/4 p-4">
        <a
          href={download_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          Download {name}
        </a>
      </div>
    );
  }
};

export default ContentViewer;

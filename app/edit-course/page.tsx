"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation"; // Use this to handle query parameters

export default function EditCoursePage() {
  const searchParams = useSearchParams(); // Get query parameters dynamically
  const repoName = searchParams.get("repoName"); // Extract `repoName` from the URL
  const [folderPath, setFolderPath] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Function to handle file upload and folder creation
  const handleAction = async () => {
    if (!repoName) {
      setUploadStatus("Repository name is missing in the URL.");
      return;
    }

    if (!folderPath.trim()) {
      setUploadStatus("Please enter a folder path.");
      return;
    }

    if (!file) {
      setUploadStatus("Please select a file to upload.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("repoName", repoName);
      formData.append("folderPath", folderPath);
      formData.append("file", file);

      const response = await fetch("http://localhost:4000/api/handle-file", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadStatus("File uploaded successfully!");
      } else {
        const errorData = await response.json();
        setUploadStatus(errorData.error || "An error occurred while uploading the file.");
      }
    } catch (error) {
      setUploadStatus("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md animate-fadeIn">
        <h1 className="text-2xl font-bold text-blue-600 mb-6 text-center">Learning Center</h1>

        <div className="mb-6">
          <label htmlFor="folderPath" className="block text-gray-700 font-medium mb-2">
            Folder Path
          </label>
          <input
            id="folderPath"
            type="text"
            placeholder="Enter folder path (e.g., week1)"
            value={folderPath}
            onChange={(e) => setFolderPath(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="fileUpload" className="block text-gray-700 font-medium mb-2">
            Select File
          </label>
          <input
            id="fileUpload"
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={handleAction}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Upload File
        </button>

        {uploadStatus && (
          <p
            className={`mt-4 text-center ${
              uploadStatus.includes("successfully") ? "text-green-600" : "text-red-600"
            }`}
          >
            {uploadStatus}
          </p>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from 'react';

export default function EditCoursePage() {
  const [folderPath, setFolderPath] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  // Function to create folder
  const handleCreateFolder = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/create-folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoName: 'example-course-name', folderPath }), // Replace with actual repo name
      });

      if (response.ok) {
        setUploadStatus('Folder created successfully!');
      } else {
        const data = await response.json();
        setUploadStatus(data.error || 'Failed to create folder');
      }
    } catch (error) {
      setUploadStatus('An error occurred while creating the folder');
    }
  };

  // Function to handle file upload
  const handleFileUpload = async () => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('repoName', 'example-course-name'); // Replace with actual repo name
      formData.append('folderPath', folderPath); // Specify folder path

      const response = await fetch('http://localhost:4000/api/upload-file', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setUploadStatus('File uploaded successfully!');
      } else {
        const data = await response.json();
        setUploadStatus(data.error || 'File upload failed');
      }
    } catch (error) {
      setUploadStatus('An error occurred while uploading the file');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Edit Course</h1>
      
      {/* Folder Creation Section */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Folder path (e.g., week1)"
          value={folderPath}
          onChange={(e) => setFolderPath(e.target.value)}
          className="border p-2 rounded w-full mb-2"
        />
        <button
          onClick={handleCreateFolder}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Create Folder
        </button>
      </div>

      {/* File Upload Section */}
      <div className="mb-4">
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button
          onClick={handleFileUpload}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Upload File
        </button>
      </div>

      {uploadStatus && <p className="text-gray-600">{uploadStatus}</p>}
    </div>
  );
}

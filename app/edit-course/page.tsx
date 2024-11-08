"use client";

import { useState } from 'react';

export default function EditCoursePage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('courseName', 'example-course-name'); // Replace with actual course name

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
      
      {/* File Upload Section */}
      <div className="mb-4">
        <input type="file" onChange={handleFileChange} />
        <button
          onClick={handleFileUpload}
          className="mt-2 bg-blue-600 text-white p-2 rounded"
        >
          Upload File
        </button>
      </div>

      {uploadStatus && <p>{uploadStatus}</p>}
    </div>
  );
}

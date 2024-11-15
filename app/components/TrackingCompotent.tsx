"use client";

import { useState, useEffect } from "react";

export default function ProgressTracker() {
  // Example dynamic progress state
  const [progress, setProgress] = useState({ watched: 16, total: 39 });

  // Calculate completion percentage
  const completionPercentage = Math.round((progress.watched / progress.total) * 100);

  return (
    <div
      className="fixed right-4 bottom-4 bg-white shadow-lg rounded-lg p-4 w-80"
      style={{ zIndex: 1000 }}
    >
      <h2 className="text-lg font-semibold mb-2">Progress Tracker</h2>
      <p className="text-sm text-gray-600 mb-2">
        Videos Watched: <strong>{progress.watched} of {progress.total}</strong> ({completionPercentage}%)
      </p>
      <div className="w-full bg-gray-200 h-4 rounded-lg overflow-hidden">
        <div
          className="bg-green-500 h-4"
          style={{ width: `${completionPercentage}%` }}
        ></div>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Progress may take up to 2 hours to reflect.
      </p>
    </div>
  );
}

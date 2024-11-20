import React from "react";

interface ProgressTrackerProps {
  completedModules: string[];
  totalModules: number;
  progressPercentage: number;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  completedModules,
  totalModules,
  progressPercentage,
}) => (
  <div className="fixed right-4 bottom-4 bg-white shadow-lg rounded-lg p-4 w-80">
    <h2 className="text-lg font-semibold mb-2">Progress Tracker</h2>
    <p className="text-sm text-gray-600 mb-2">
      Modules Completed: {completedModules.length} / {totalModules} ({progressPercentage}%)
    </p>
    <div className="w-full bg-gray-200 h-4 rounded-lg overflow-hidden">
      <div
        className="bg-green-500 h-4"
        style={{
          width: `${progressPercentage}%`,
        }}
      ></div>
    </div>
    <p className="text-xs text-gray-500 mt-2">Progress is automatically saved.</p>
  </div>
);

export default ProgressTracker;

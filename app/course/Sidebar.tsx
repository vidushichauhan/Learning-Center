import React, { Dispatch, SetStateAction } from "react";
import { fetchContents } from "../utils/api";

interface RepoContent {
  name: string;
  path: string;
  type: string;
  download_url: string | null;
}

interface SidebarProps {
  contents: RepoContent[];
  subDirectories: Record<string, RepoContent[]>;
  completedModules: string[];
  onModuleClick: (module: RepoContent) => void;
  setSubDirectories: Dispatch<SetStateAction<Record<string, RepoContent[]>>>;
  repoName: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  contents,
  subDirectories,
  completedModules,
  onModuleClick,
  setSubDirectories,
  repoName,
}) => {
  // Helper to filter out invalid files (e.g., .keep)
  const filterValidFiles = (items: RepoContent[]): RepoContent[] =>
    items.filter((item) => !/^\.(keep)$/i.test(item.name));

  // Handle directory click to fetch subdirectory contents
  const handleDirectoryClick = async (path: string) => {
    if (!subDirectories[path]) {
      try {
        const data = await fetchContents(repoName, path); // Fetch content from API
        if (Array.isArray(data)) {
          // Update state with new subdirectory data
          setSubDirectories((prev) => ({
            ...prev,
            [path]: filterValidFiles(data),
          }));
        } else {
          console.error("Data fetched is not an array");
        }
      } catch (error) {
        console.error("Error fetching subdirectory contents:", error);
      }
    }
  };

  // Render directory content recursively
  const renderDirectory = (items: RepoContent[], parentPath: string) => {
    return (
      <ul className="ml-4 space-y-2">
        {items.map((item) => (
          <li key={item.path}>
            <div
              onClick={() =>
                item.type === "dir"
                  ? handleDirectoryClick(item.path)
                  : onModuleClick(item)
              }
              className={`p-2 rounded cursor-pointer ${
                completedModules.includes(item.path) ? "bg-green-200" : "bg-white"
              } hover:bg-gray-200`}
            >
              {item.type === "dir" ? "📂" : "📄"} {item.name}
            </div>
            {/* Recursively render subdirectories */}
            {subDirectories[item.path] &&
              renderDirectory(subDirectories[item.path], item.path)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="w-1/4 bg-gray-100 p-4 border-r overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Course Content</h2>
      <ul className="space-y-2">
        {filterValidFiles(contents).map((item) => (
          <li key={item.path}>
            <div
              onClick={() =>
                item.type === "dir"
                  ? handleDirectoryClick(item.path)
                  : onModuleClick(item)
              }
              className={`p-2 rounded cursor-pointer ${
                completedModules.includes(item.path) ? "bg-green-200" : "bg-white"
              } hover:bg-gray-200`}
            >
              {item.type === "dir" ? "📂" : "📄"} {item.name}
            </div>
            {/* Render subdirectories if they exist */}
            {subDirectories[item.path] &&
              renderDirectory(subDirectories[item.path], item.path)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;

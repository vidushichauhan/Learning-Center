import React, { Dispatch, SetStateAction } from "react";
import { fetchContents } from "../utils/api";

interface RepoContent {
  name: string;
  path: string;
  type: string; // 'file' or 'dir'
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
  const handleDirectoryClick = async (path: string) => {
    if (!subDirectories[path]) {
      try {
        const data = await fetchContents(repoName, path);
        setSubDirectories((prev) => ({ ...prev, [path]: data }));
      } catch (error) {
        console.error("Failed to fetch directory contents", error);
      }
    }
  };

  return (
    <div className="w-1/4 bg-gray-100 p-4 border-r overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Course Content</h2>
      <ul className="space-y-2">
        {contents.map((item) => (
          <li key={item.path}>
            <div
              onClick={() =>
                item.type === "dir" ? handleDirectoryClick(item.path) : onModuleClick(item)
              }
              className={`p-2 rounded cursor-pointer ${
                completedModules.includes(item.path) ? "bg-green-200" : "bg-white"
              } hover:bg-gray-200`}
            >
              {item.type === "dir" ? "📂" : "📄"} {item.name}
            </div>
            {/* Render subdirectories if they exist */}
            {subDirectories[item.path] && (
              <ul className="ml-4 space-y-2">
                {subDirectories[item.path].map((subItem) => (
                  <li
                    key={subItem.path}
                    onClick={() => onModuleClick(subItem)}
                    className={`p-2 rounded cursor-pointer ${
                      completedModules.includes(subItem.path) ? "bg-green-200" : "bg-white"
                    } hover:bg-gray-200`}
                  >
                    {subItem.type === "dir" ? "📂" : "📄"} {subItem.name}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useAuth } from "../AuthContext"; // Update this path to your actual AuthContext file

interface RepoContent {
  name: string;
  path: string;
  type: string; // 'file' or 'dir'
  download_url: string | null;
}

export default function CoursePage() {
  const searchParams = useSearchParams();
  const repoName = searchParams.get("repoName");
  const folderPath = searchParams.get("path") || "";

  const { currentUser } = useAuth(); // Use AuthContext to check user role

  const [contents, setContents] = useState<RepoContent[]>([]);
  const [subDirectories, setSubDirectories] = useState<Record<string, RepoContent[]>>({});
  const [selectedModule, setSelectedModule] = useState<RepoContent | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load completed modules from local storage
  useEffect(() => {
    const savedProgress = localStorage.getItem("completedModules");
    if (savedProgress) {
      setCompletedModules(JSON.parse(savedProgress));
    }
  }, []);

  // Fetch initial folder contents
  useEffect(() => {
    if (repoName) {
      fetchContents(folderPath);
    }
  }, [repoName, folderPath]);

  const fetchContents = (path: string) => {
    const apiUrl = path
      ? `http://localhost:4000/api/repos/${repoName}/contents/${path}`
      : `http://localhost:4000/api/repos/${repoName}/contents`;

    setLoading(true);
    setError(null);
    fetch(apiUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch folder contents");
        }
        return response.json();
      })
      .then((data: RepoContent[]) => {
        if (path) {
          setSubDirectories((prev) => ({ ...prev, [path]: data }));
        } else {
          setContents(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err.message);
        setError("Error loading folder contents. Please try again.");
        setLoading(false);
      });
  };

  const handleModuleClick = (module: RepoContent) => {
    setSelectedModule(module);

    // Mark module as completed and persist in local storage
    if (!completedModules.includes(module.path)) {
      const updatedProgress = [...completedModules, module.path];
      setCompletedModules(updatedProgress);
      localStorage.setItem("completedModules", JSON.stringify(updatedProgress));
    }

    // Fetch file content if it's a file
    if (module.type === "file") {
      if (module.name.endsWith(".md")) {
        fetch(`http://localhost:4000/api/proxy/readme?repoName=${repoName}&path=${module.path}`)
          .then((response) => response.text())
          .then((data) => setFileContent(data))
          .catch((err) => console.error("Error fetching README.md content:", err.message));
      } else {
        setFileContent(null);
      }
    } else if (module.type === "dir") {
      // Fetch subdirectory contents if not already fetched
      if (!subDirectories[module.path]) {
        fetchContents(module.path);
      }
    }
  };

  const filteredContents = contents.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subDirectories[item.path] &&
        subDirectories[item.path].some((subItem) =>
          subItem.name.toLowerCase().includes(searchTerm.toLowerCase())
        ))
  );

  const totalModules = contents.length + Object.values(subDirectories).flat().length;
  const progressPercentage = totalModules
    ? Math.round((completedModules.length / totalModules) * 100)
    : 0;

  if (loading) {
    return <p className="text-center text-xl text-gray-500">Loading...</p>;
  }

  return (
    <div className="relative mt-20">
      {/* Sidebar */}
      <div className="flex min-h-screen">
        <div className="w-1/4 bg-gray-100 p-4 border-r overflow-y-auto">
          <h2 className="text-lg font-bold mb-4">Course Content</h2>
          <input
            type="text"
            placeholder="Search modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full mb-4"
          />
          {error && <p className="text-red-500">{error}</p>}
          <ul className="space-y-2">
            {filteredContents.map((item) => (
              <li key={item.path}>
                <div
                  onClick={() => handleModuleClick(item)}
                  className={`p-2 rounded cursor-pointer ${
                    completedModules.includes(item.path) ? "bg-green-200" : "bg-white"
                  } hover:bg-gray-200`}
                >
                  {item.type === "dir" ? "📂" : "📄"} {item.name}
                </div>
                {subDirectories[item.path] && (
                  <ul className="ml-4 space-y-2">
                    {subDirectories[item.path].map((subItem) => (
                      <li
                        key={subItem.path}
                        onClick={() => handleModuleClick(subItem)}
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

        {/* Content Area */}
        <div className="w-3/4 p-4 flex flex-col items-center">
          {selectedModule ? (
            selectedModule.type === "file" ? (
              selectedModule.name.endsWith(".md") && fileContent ? (
                <div className="w-full max-w-3xl">
                  <h3 className="text-xl font-bold mb-4">{selectedModule.name}</h3>
                  <ReactMarkdown className="bg-gray-100 p-4 rounded">{fileContent}</ReactMarkdown>
                </div>
              ) : selectedModule.name.endsWith(".mp4") ? (
                <div className="w-full max-w-3xl">
                  <h3 className="text-xl font-bold mb-4">{selectedModule.name}</h3>
                  <video
                    controls
                    className="w-full h-80 rounded border shadow-md"
                    src={selectedModule.download_url || undefined}
                  />
                </div>
              ) : selectedModule.name.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                <div className="w-full max-w-3xl">
                  <h3 className="text-xl font-bold mb-4">{selectedModule.name}</h3>
                  <img
                    src={selectedModule.download_url || undefined}
                    alt={selectedModule.name}
                    className="rounded border shadow-md"
                  />
                  <a
                    href={selectedModule.download_url || undefined}
                    download={selectedModule.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-block text-blue-600 underline"
                  >
                    Download Image
                  </a>
                </div>
              ) : (
                <a
                  href={selectedModule.download_url || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline"
                >
                  Download File
                </a>
              )
            ) : (
              <p className="text-gray-600">This folder is empty or not viewable.</p>
            )
          ) : (
            <p className="text-gray-600">Select a module to view its content.</p>
          )}
        </div>
      </div>

      {/* Progress Tracker */}
      {currentUser?.role === "student" && (
        <div
          className="fixed right-4 bottom-4 bg-white shadow-lg rounded-lg p-4 w-80"
          style={{ zIndex: 1000 }}
        >
          <h2 className="text-lg font-semibold mb-2">Progress Tracker</h2>
          <p className="text-sm text-gray-600 mb-2">
            Modules Completed: {completedModules.length} / {totalModules} ({progressPercentage}%)
          </p>
          <div className="w-full bg-gray-200 h-4 rounded-lg overflow-hidden">
            <div
              className="bg-green-500 h-4"
              style={{
                width: `${progressPercentage}%`,
                transition: "width 0.5s ease-in-out",
              }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Progress is automatically saved.</p>
        </div>
      )}
    </div>
  );
}

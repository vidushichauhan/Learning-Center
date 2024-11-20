"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import Sidebar from "./Sidebar";
import ContentViewer from "./ContentViewer";
import ProgressTracker from "./ProgressTracker";
import { fetchContents } from "../utils/api";

interface RepoContent {
  name: string;
  path: string;
  type: string; // 'file' or 'dir'
  download_url: string | null;
}

export default function CoursePage() {
  const searchParams = useSearchParams();
  const repoName = searchParams.get("repoName") || ""; // Use empty string as fallback
  const folderPath = searchParams.get("path") || "";

  const { currentUser } = useAuth();

  const [contents, setContents] = useState<RepoContent[]>([]);
  const [subDirectories, setSubDirectories] = useState<Record<string, RepoContent[]>>({});
  const [selectedModule, setSelectedModule] = useState<RepoContent | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load completed modules from local storage
  useEffect(() => {
    const savedProgress = localStorage.getItem("completedModules");
    if (savedProgress) {
      // Only load valid data
      try {
        const parsedProgress = JSON.parse(savedProgress);
        if (Array.isArray(parsedProgress)) {
          setCompletedModules(parsedProgress);
        } else {
          localStorage.removeItem("completedModules");
        }
      } catch {
        localStorage.removeItem("completedModules");
      }
    }
  }, []);
  

  // Fetch initial folder contents
  useEffect(() => {
    if (repoName) {
      setLoading(true);
      fetchContents(repoName, folderPath)
        .then((data) => setContents(data))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [repoName, folderPath]);

  const handleModuleClick = (module: RepoContent) => {
    setSelectedModule(module);
  
    if (!completedModules.includes(module.path)) {
      const updatedProgress = Array.from(new Set([...completedModules, module.path]));
      setCompletedModules(updatedProgress);
      localStorage.setItem("completedModules", JSON.stringify(updatedProgress));
    }
  
    if (module.type === "dir" && !subDirectories[module.path]) {
      fetchContents(repoName, module.path)
        .then((data) => {
          setSubDirectories((prev) => ({ ...prev, [module.path]: data }));
        })
        .catch((err) => console.error(err));
    }
  };
  
  const totalModules =
  contents.length + Object.values(subDirectories).reduce((sum, items) => sum + (items?.length || 0), 0);

  console.log("Total Modules:", totalModules);


  const progressPercentage = totalModules
    ? Math.min(Math.round((completedModules.length / totalModules) * 100), 100)
    : 0;

  if (loading) {
    return <p className="text-center text-xl text-gray-500">Loading...</p>;
  }

  return (
    <div className="relative mt-20 flex">
      <Sidebar
        contents={contents}
        subDirectories={subDirectories}
        completedModules={completedModules}
        onModuleClick={handleModuleClick}
        setSubDirectories={setSubDirectories}
        repoName={repoName}
      />
      <ContentViewer selectedModule={selectedModule} />
      {currentUser?.role === "student" && (
        <ProgressTracker
          completedModules={completedModules}
          totalModules={totalModules}
          progressPercentage={progressPercentage}
        />
      )}
    </div>
  );
}

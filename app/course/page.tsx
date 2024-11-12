'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RepoContent {
  name: string;
  path: string;
  type: string; // 'file' or 'dir'
  download_url: string | null;
}

export default function CoursePage() {
  const searchParams = useSearchParams();
  const repoName = searchParams.get('repoName'); // GitHub repo name
  const folderPath = searchParams.get('path') || ''; // Track folder paths

  const [contents, setContents] = useState<RepoContent[]>([]);
  const [selectedModule, setSelectedModule] = useState<RepoContent | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDirs, setExpandedDirs] = useState<Record<string, RepoContent[]>>({}); // Tracks expanded folders with contents

  // Fetch folder contents
  useEffect(() => {
    if (repoName) {
      const apiUrl = folderPath
        ? `http://localhost:4000/api/repos/${repoName}/contents/${folderPath}`
        : `http://localhost:4000/api/repos/${repoName}/contents`;

      fetch(apiUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch folder contents');
          }
          return response.json();
        })
        .then((data: RepoContent[]) => {
          setContents(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err.message);
          setLoading(false);
        });
    }
  }, [repoName, folderPath]);

  const handleModuleClick = (module: RepoContent) => {
    if (module.type === 'dir') {
      if (!expandedDirs[module.path]) {
        // Fetch subdirectory contents if not already expanded
        const apiUrl = `http://localhost:4000/api/repos/${repoName}/contents/${module.path}`;
        fetch(apiUrl)
          .then((response) => response.json())
          .then((data: RepoContent[]) => {
            setExpandedDirs((prev) => ({
              ...prev,
              [module.path]: data,
            }));
          })
          .catch((err) => console.error('Error fetching subdirectory:', err.message));
      } else {
        // Collapse the directory if already expanded
        setExpandedDirs((prev) => {
          const newDirs = { ...prev };
          delete newDirs[module.path];
          return newDirs;
        });
      }
    } else {
      setSelectedModule(module);

      // Mark module as completed
      if (!completedModules.includes(module.name)) {
        setCompletedModules((prev) => [...prev, module.name]);
      }

      // Fetch file content if it's a file
      if (module.download_url) {
        fetch(module.download_url)
          .then((response) => response.text())
          .then((data) => setFileContent(data))
          .catch((err) => console.error('Error fetching file content:', err.message));
      } else {
        setFileContent(null);
      }
    }
  };

  if (loading) {
    return <p className="text-center text-xl text-gray-500">Loading...</p>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-bold mb-4">Course Content</h2>
        <ul className="space-y-2">
          {contents.map((item) => (
            <li key={item.path}>
              <div
                onClick={() => handleModuleClick(item)}
                className={`p-2 rounded cursor-pointer flex items-center ${
                  completedModules.includes(item.name) ? 'bg-green-200' : 'bg-white'
                } hover:bg-gray-200`}
              >
                {item.type === 'dir' ? '📂' : '📄'} {item.name}
              </div>
              {/* Render subdirectory contents */}
              {item.type === 'dir' && expandedDirs[item.path] && (
                <ul className="pl-4 mt-2 space-y-1">
                  {expandedDirs[item.path].map((subItem) => (
                    <li
                      key={subItem.path}
                      onClick={() => handleModuleClick(subItem)}
                      className={`p-2 rounded cursor-pointer flex items-center ${
                        completedModules.includes(subItem.name) ? 'bg-green-200' : 'bg-white'
                      } hover:bg-gray-200`}
                    >
                      {subItem.type === 'dir' ? '📂' : '📄'} {subItem.name}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Content Area */}
      <div className="w-3/4 p-6">
        {selectedModule ? (
          selectedModule.type === 'file' ? (
            selectedModule.name.endsWith('.md') && fileContent ? (
              <div>
                <h3 className="text-xl font-bold">{selectedModule.name}</h3>
                <pre className="bg-gray-100 p-4 rounded">{fileContent}</pre>
              </div>
            ) : selectedModule.name.match(/\.(png|jpg|jpeg|gif)$/i) ? (
              <div>
                <h3 className="text-xl font-bold">{selectedModule.name}</h3>
                <img
                  src={selectedModule.download_url || ''}
                  alt={selectedModule.name}
                  className="w-full h-auto mt-4 rounded border"
                />
                <a
                  href={selectedModule.download_url || ''}
                  download={selectedModule.name}
                  className="mt-2 inline-block text-blue-600 underline"
                >
                  Download Image
                </a>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold">{selectedModule.name}</h3>
                <a
                  href={selectedModule.download_url || ''}
                  download={selectedModule.name}
                  className="text-blue-600 underline"
                >
                  Download File
                </a>
              </div>
            )
          ) : (
            <p className="text-gray-600">This folder is empty or not viewable.</p>
          )
        ) : (
          <p className="text-gray-600">Select a module to view its content.</p>
        )}
      </div>
    </div>
  );
}

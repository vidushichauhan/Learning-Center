'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RepoContent {
  name: string;
  path: string;
  type: string; // 'file' or 'dir'
  download_url: string | null;
}

export default function CoursePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const repoName = searchParams.get('repoName');
  const folderPath = searchParams.get('path') || '';

  const [contents, setContents] = useState<RepoContent[]>([]);
  const [selectedModule, setSelectedModule] = useState<RepoContent | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

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
    setSelectedModule(module);

    // Mark module as completed
    if (!completedModules.includes(module.name)) {
      setCompletedModules((prev) => [...prev, module.name]);
    }

    // Fetch content for files
    if (module.type === 'file') {
      fetch(`http://localhost:4000/api/repos/${repoName}/raw/${module.path}`)
        .then((response) => response.text())
        .then((data) => setFileContent(data))
        .catch((err) => console.error('Error fetching file content:', err.message));
    } else {
      setFileContent(null);
    }
  };

  if (loading) {
    return <p className="text-center text-xl text-gray-500 mt-4">Loading...</p>;
  }

  return (
    <div className="flex min-h-screen mt-20">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 border-r">
        <h2 className="text-lg font-bold mb-4">Course Content</h2>
        <ul className="space-y-2">
          {contents.map((item) => (
            <li
              key={item.path}
              onClick={() => handleModuleClick(item)}
              className={`p-2 rounded cursor-pointer ${
                completedModules.includes(item.name) ? 'bg-green-200' : 'bg-white'
              } hover:bg-gray-200`}
            >
              {item.type === 'dir' ? '📂' : '📄'} {item.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Content Area */}
      <div className="w-3/4 p-4 mt-4">
        {selectedModule ? (
          selectedModule.type === 'file' ? (
            selectedModule.name.endsWith('.md') && fileContent ? (
              <div>
                <h3 className="text-xl font-bold">{selectedModule.name}</h3>
                <pre className="bg-gray-100 p-4 rounded mt-4">{fileContent}</pre>
              </div>
            ) : selectedModule.name.endsWith('.mp4') ? (
              <div>
                <h3 className="text-xl font-bold">{selectedModule.name}</h3>
                <video
                  controls
                  className="w-full mt-4 max-h-[500px]" // Restrict video size
                  src={selectedModule.download_url || undefined}
                ></video>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold">{selectedModule.name}</h3>
                {selectedModule.name.match(/\.(png|jpg|jpeg|gif)$/i) ? (
                  <div>
                    <img
                      src={selectedModule.download_url || undefined}
                      alt={selectedModule.name}
                      className="w-full mt-4 rounded border max-h-[500px] object-contain"
                    />
                    <a
                      href={selectedModule.download_url || undefined}
                      download={selectedModule.name}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-blue-600 underline"
                    >
                      Download Image
                    </a>
                  </div>
                ) : (
                  <a
                    href={selectedModule.download_url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline mt-4 block"
                  >
                    Download File
                  </a>
                )}
              </div>
            )
          ) : (
            <p className="text-gray-600 mt-4">This folder is empty or not viewable.</p>
          )
        ) : (
          <p className="text-gray-600 mt-4">Select a module to view its content.</p>
        )}
      </div>
    </div>
  );
}

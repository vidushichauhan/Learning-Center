'use client';

import { useSearchParams, useRouter } from 'next/navigation'; // Use correct imports
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
  const folderPath = searchParams.get('path') || ''; // Track folder paths

  const [contents, setContents] = useState<RepoContent[]>([]);
  const [error, setError] = useState<string | null>(null);
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
          setError(err.message);
          setLoading(false);
        });
    }
  }, [repoName, folderPath]);

  const handleFolderClick = (path: string) => {
    router.push(`/course?repoName=${repoName}&path=${path}`);
  };

  if (loading) {
    return <p className="text-center text-xl text-gray-500">Loading...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500 text-xl">Error: {error}</p>;
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">{repoName}</h1>

      <ul className="space-y-4">
        {contents.map((item) => (
          <li
            key={item.path}
            className="group flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-lg transition-all duration-200"
          >
            {item.type === 'dir' ? (
              <span
                onClick={() => handleFolderClick(item.path)}
                className="cursor-pointer text-lg font-semibold text-blue-600 group-hover:underline"
              >
                📂 {item.name}
              </span>
            ) : (
              <a
                href={item.download_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold text-blue-500 hover:underline"
              >
                📄 {item.name}
              </a>
            )}
            <span className="text-sm text-gray-400">
              {item.type === 'dir' ? 'Folder' : 'File'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

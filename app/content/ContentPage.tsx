// app/content/ContentPage.tsx

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
}

export default function ContentPage() {
  const { currentUser } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:4000/api/repos')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        return response.json();
      })
      .then((data: Repository[]) => setRepositories(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleCourseClick = (repoName: string) => {
    router.push(`/course?repoName=${repoName}`);
  };

  const handleEditCourse = (repoName: string) => {
    router.push(`/edit-course?repoName=${repoName}`);
  };

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {currentUser?.role === 'teacher' ? 'Manage Courses' : 'Courses Uploaded'}
      </h1>

      <input
        type="text"
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded mb-6 w-full md:w-1/2 mx-auto block"
      />

      {error ? (
        <p className="text-red-500 text-center">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map((repo) => (
            <div
              key={repo.id}
              className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCourseClick(repo.name)}
            >
              <h2 className="text-xl font-semibold text-blue-600">{repo.name}</h2>
              <p className="mt-2 text-gray-700">
                {repo.description || 'No description provided.'}
              </p>
              <div className="mt-4 text-sm text-gray-500">
                ⭐ {repo.stargazers_count} | Forks: {repo.forks_count}
              </div>

              {currentUser?.role === 'teacher' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCourse(repo.name);
                  }}
                  className="mt-4 bg-green-600 text-white p-2 rounded"
                >
                  Edit Content
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

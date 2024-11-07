'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
}

export default function TeacherCourses() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:4000/api/teacher-courses')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch teacher courses');
        }
        return response.json();
      })
      .then((data: Repository[]) => setRepositories(data))
      .catch((err) => setError(err.message));
  }, []);

  const handleEditCourse = (repoName: string) => {
    router.push(`/edit-course?repoName=${repoName}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Your Uploaded Courses</h2>
      {error ? (
        <p className="text-red-500 text-center">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo) => (
            <div key={repo.id} className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-blue-600">{repo.name}</h3>
              <p>{repo.description || 'No description provided.'}</p>
              <div className="mt-4 text-sm text-gray-500">
                ⭐ {repo.stargazers_count} | Forks: {repo.forks_count}
              </div>
              <button
                onClick={() => handleEditCourse(repo.name)}
                className="mt-4 bg-green-600 text-white p-2 rounded"
              >
                Edit Content
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
}

export default function StudentCourses() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/student-courses')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch student courses');
        }
        return response.json();
      })
      .then((data: Repository[]) => setRepositories(data))
      .catch((err) => setError(err.message));
  }, []);

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-center">Your Courses</h2>
      <input
        type="text"
        placeholder="Search your courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded mb-6 w-full md:w-1/2 mx-auto block"
      />
      {error ? (
        <p className="text-red-500 text-center">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRepositories.map((repo) => (
            <div key={repo.id} className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-blue-600">{repo.name}</h3>
              <p>{repo.description || 'No description provided.'}</p>
              <div className="mt-4 text-sm text-gray-500">
                ⭐ {repo.stargazers_count} | Forks: {repo.forks_count}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

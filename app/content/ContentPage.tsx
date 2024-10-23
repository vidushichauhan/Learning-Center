'use client'; // Ensures this is a client component

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Correct import for Next.js 13+

// Define the shape of a repository
interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
}

export default function ContentPage() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Router for navigation

  // Fetch repositories on component mount
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
    router.push(`/course?repoName=${repoName}`); // Use query parameters
  };
    

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Courses Uploaded</h1>
      {error ? (
        <p className="text-red-500 text-center">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo) => (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

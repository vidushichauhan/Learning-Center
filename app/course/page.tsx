'use client'; // Ensure it's a client-side component

import { useSearchParams, useRouter } from 'next/navigation'; // Correct imports
import { useEffect, useState } from 'react';

export default function CoursePage() {
  const searchParams = useSearchParams(); // Get query parameters
  const repoName = searchParams.get('repoName'); // Extract 'repoName'
  const router = useRouter(); // Use router from next/navigation for redirects if needed

  const [readmeContent, setReadmeContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (repoName) {
      fetch(`http://localhost:4000/api/readme/LearningCenter-web/${repoName}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Failed to fetch README.md');
          }
          return response.text();
        })
        .then((data) => {
          setReadmeContent(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [repoName]);

  if (loading) {
    return <p className="text-center">Loading...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">{repoName}</h1>
      {error ? (
        <p className="text-red-500 text-center">Error: {error}</p>
      ) : (
        <pre>{readmeContent}</pre>
      )}
    </div>
  );
}

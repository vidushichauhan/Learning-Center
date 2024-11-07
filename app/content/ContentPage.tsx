'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

export default function ContentPage() {
  const { currentUser } = useAuth();
  const [repositories, setRepositories] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('http://localhost:4000/api/repos')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        return response.json();
      })
      .then((data) => setRepositories(data))
      .catch((err) => setError(err.message));
  }, []);

  const addToCart = async (courseId: string, courseName: string) => {
    try {
      const response = await fetch('http://localhost:4000/api/orders/add-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          username: currentUser?.username,
          courseId,
          courseName,
        }),
      });

      if (response.ok) {
        alert('Course added to cart successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to add course to cart');
      }
    } catch (error) {
      alert('An error occurred while adding the course to cart');
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Courses Uploaded</h1>

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
          {repositories.map((repo) => (
            <div key={repo.id} className="p-4 border rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-blue-600">{repo.name}</h2>
              <p className="mt-2 text-gray-700">{repo.description || 'No description provided.'}</p>
              <div className="mt-4 text-sm text-gray-500">
                ⭐ {repo.stargazers_count} | Forks: {repo.forks_count}
              </div>
              {currentUser?.role === 'student' && (
                <button
                  onClick={() => addToCart(repo.id, repo.name)}
                  className="mt-4 bg-blue-600 text-white p-2 rounded"
                >
                  Add to Cart
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

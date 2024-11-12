"use client";

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
  const [courseImages, setCourseImages] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    fetch('http://localhost:4000/api/repos')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch repositories');
        }
        return response.json();
      })
      .then((data: Repository[]) => {
        setRepositories(data);
        data.forEach((repo) => fetchCourseImage(repo.name));
      })
      .catch((err) => setError(err.message));
  }, []);

  const fetchCourseImage = async (repoName: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/repos/${repoName}/contents/image`);
  
      if (!response.ok) {
        throw new Error("Image folder not found");
      }
  
      const contents = await response.json();
  
      if (Array.isArray(contents)) {
        const imageFile = contents.find(
          (file: any) => file.type === 'file' && (file.name === 'image.jpg' || file.name === 'download.png')
        );
  
        const imageUrl = imageFile ? imageFile.download_url : '';
  
        if (imageUrl) {
          console.log(`Image URL for ${repoName}:`, JSON.stringify({ imageUrl }));
        } else {
          console.warn(`No suitable image found for ${repoName}`);
        }
  
        setCourseImages((prevImages) => ({
          ...prevImages,
          [repoName]: imageUrl,
        }));
      } else {
        console.warn(`Contents for ${repoName} is not an array or image not found.`);
        setCourseImages((prevImages) => ({
          ...prevImages,
          [repoName]: '', // Empty string triggers the initials display
        }));
      }
    } catch (error) {
      console.warn(`Failed to fetch image for ${repoName}:`, error.message);
      setCourseImages((prevImages) => ({
        ...prevImages,
        [repoName]: '', // Empty string triggers the initials display
      }));
    }
  };
  
  const addToCart = async (courseId: number, courseName: string) => {
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

  const handleCourseClick = (repoName: string) => {
    router.push(`/course?repoName=${repoName}`);
  };

  const handleEditCourse = (repoName: string) => {
    router.push(`/edit-course?repoName=${repoName}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word.charAt(0))
      .join('')
      .toUpperCase();
  };

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          {filteredRepositories.map((repo) => (
            <div
              key={repo.id}
              className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCourseClick(repo.name)}
            >
              {courseImages[repo.name] ? (
                <img
                  src={courseImages[repo.name]}
                  alt={`${repo.name} cover`}
                  className="w-full h-40 object-cover rounded"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = ''; // Trigger fallback
                  }}
                />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-gray-200 rounded">
                  <span className="text-4xl font-bold text-gray-500">{getInitials(repo.name)}</span>
                </div>
              )}

              <h2 className="text-xl font-semibold text-blue-600 mt-4">{repo.name}</h2>
              <p className="mt-2 text-gray-700">{repo.description || 'No description provided.'}</p>
              <div className="mt-4 text-sm text-gray-500">
                ⭐ {repo.stargazers_count} | Forks: {repo.forks_count}
              </div>
              {currentUser?.role === 'student' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(repo.id, repo.name);
                  }}
                  className="mt-4 bg-blue-600 text-white p-2 rounded"
                >
                  Add to Cart
                </button>
              )}
              {currentUser?.role === 'teacher' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditCourse(repo.name);
                  }}
                  className="mt-4 bg-green-600 text-white p-2 rounded"
                >
                  Edit
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface CourseCardProps {
  repo: Repository;
  currentUserRole: string;
  courseImage: string | undefined;
  onAddToCart: (courseId: number, courseName: string, price: string) => void;
  onEditCourse: (repoName: string) => void;
  onCourseClick: (repoName: string) => void;
}

const CourseCard = ({
  repo,
  currentUserRole,
  courseImage,
  onAddToCart,
  onEditCourse,
  onCourseClick,
}: CourseCardProps) => {
  const [courseDetails, setCourseDetails] = useState<{ price: string; teacher: string }>({
    price: "Free",
    teacher: "Unknown",
  });

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`http://localhost:4000/readme/${repo.name}`);
        if (response.ok) {
          const data = await response.json();
          setCourseDetails({
            price: data.price || "Free",
            teacher: data.teacher || "Unknown",
          });
        }
      } catch (error) {
        console.error("Error fetching course details:", error);
      }
    };

    fetchCourseDetails();
  }, [repo.name]);

  return (
    <div
      className="p-6 border border-gray-200 rounded-xl shadow-md hover:shadow-2xl hover:scale-105 transition-all cursor-pointer bg-gradient-to-b from-white to-gray-50"
      onClick={() => onCourseClick(repo.name)}
    >
      {courseImage ? (
        <img src={courseImage} alt={`${repo.name} cover`} className="w-full h-40 object-cover rounded" />
      ) : (
        <div className="w-full h-40 flex items-center justify-center bg-gray-200 rounded">
          <span className="text-5xl font-bold text-gray-500">{repo.name.charAt(0)}</span>
        </div>
      )}

      <h2 className="text-lg font-semibold text-blue-700 mt-4 truncate">{repo.name}</h2>
      <p className="text-sm text-gray-600 mt-2">{repo.description || "No description provided."}</p>
      <p className="text-sm text-gray-700 mt-2">
        <strong>Teacher:</strong> {courseDetails.teacher}
      </p>
      <p className="text-sm text-gray-700 mt-2">
        <strong>Price:</strong> {courseDetails.price}
      </p>

      {currentUserRole === "student" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(repo.id, repo.name, courseDetails.price === "Free" ? "0" : courseDetails.price);
          }}
          className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Add to Cart
        </button>
      )}
      {currentUserRole === "teacher" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditCourse(repo.name);
          }}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Edit
        </button>
      )}
    </div>
  );
};

export default CourseCard;

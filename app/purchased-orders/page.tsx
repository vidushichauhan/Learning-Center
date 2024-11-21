"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import Footer from "../components/Footer";

interface PurchasedCourse {
  courseId: string;
  courseName: string;
  purchasedAt: string;
}

export default function PurchasedOrders() {
  const { currentUser } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      fetch(`http://localhost:4000/api/orders/purchased/${currentUser.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch purchased courses");
          }
          return response.json();
        })
        .then((data) => setPurchasedCourses(data))
        .catch((err) => setError(err.message));
    }
  }, [currentUser]);

  const handleCourseClick = (courseName: string) => {
    router.push(`/course?repoName=${courseName}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <div className="flex-grow p-8 bg-gradient-to-br from-blue-50 via-indigo-100 to-purple-50">
        <h2 className="text-4xl font-extrabold text-indigo-700 text-center mb-8">
          Purchased Orders
        </h2>

        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : purchasedCourses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {purchasedCourses.map((course) => (
              <div
                key={course.courseId}
                onClick={() => handleCourseClick(course.courseName)} // Navigate to course page
                className="cursor-pointer bg-white p-6 rounded-xl shadow-lg transform transition-transform hover:scale-105 hover:shadow-2xl"
              >
                <h3 className="text-2xl font-bold text-indigo-800">
                  {course.courseName}
                </h3>
                <p className="text-gray-600 mt-4">
                  Purchased on:{" "}
                  <span className="font-semibold">
                    {new Date(course.purchasedAt).toLocaleDateString()}
                  </span>
                </p>
                <button className="mt-6 w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
                  View Course
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-700 text-lg">
            You haven’t purchased any courses yet. Start exploring!
          </p>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}

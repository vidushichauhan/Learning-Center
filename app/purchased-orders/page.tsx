"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

interface PurchasedCourse {
  courseId: string;
  courseName: string;
  purchasedAt: string; // You can use the createdAt field from MongoDB
}

export default function PurchasedOrders() {
  const { currentUser } = useAuth();
  const [purchasedCourses, setPurchasedCourses] = useState<PurchasedCourse[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Purchased Orders</h2>
      {error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : purchasedCourses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {purchasedCourses.map((course) => (
            <div key={course.courseId} className="p-4 border rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{course.courseName}</h3>
              <p className="text-gray-600 mt-2">Purchased on: {new Date(course.purchasedAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">No courses purchased yet.</p>
      )}
    </div>
  );
}

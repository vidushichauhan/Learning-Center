"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";

interface Course {
  courseId: string;
  courseName: string;
  description: string; // Added a description field
}

export default function OrderCart() {
  const { currentUser } = useAuth();
  const [cartCourses, setCartCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetch(`http://localhost:4000/api/orders/cart/${currentUser.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error("Failed to fetch cart items");
          }
          return response.json();
        })
        .then((data) => setCartCourses(data))
        .catch((err) => setError(err.message));
    }
  }, [currentUser]);

  const handleRemoveCourse = async (courseId: string) => {
    try {
      await fetch(`http://localhost:4000/api/orders/remove`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUser?.id, courseId }),
      });

      // Remove from frontend state
      setCartCourses(cartCourses.filter((course) => course.courseId !== courseId));
    } catch (err) {
      console.error("Failed to remove course:", err);
      setError("Failed to remove course from cart");
    }
  };

  const handleBuyNow = () => {
    alert("Proceeding to purchase for all courses in the cart");
    // Implement further purchase logic here (API call or further navigation)
  };

  return (
    <div className="flex min-h-screen mt-20">
      {/* Left Section: Course Details */}
      <div className="w-1/2 bg-gray-100 p-8">
        <h2 className="text-3xl font-bold mb-4">Checkout</h2>
        {error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : cartCourses.length > 0 ? (
          <>
            {cartCourses.map((course) => (
              <div
                key={course.courseId}
                className="mb-6 p-4 border rounded-lg bg-white shadow-md"
              >
                <h3 className="text-xl font-semibold">{course.courseName}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {course.description ||
                    "Access to the best resources, assignments, and discussions."}
                </p>
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => handleRemoveCourse(course.courseId)}
                    className="text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold">Why Choose Us?</h3>
              <ul className="list-disc pl-6 text-gray-600 mt-2">
                <li>Unlimited access to all courses in your order</li>
                <li>Interactive lessons, assignments, and forums</li>
                <li>Cancel anytime before the subscription starts</li>
                <li>Earn certificates to boost your resume and LinkedIn</li>
              </ul>
            </div>
          </>
        ) : (
          <p className="text-gray-600">Your cart is empty.</p>
        )}
      </div>

      {/* Right Section: Checkout Form */}
      <div className="w-1/2 bg-white p-8 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Order Summary</h2>
        <div className="text-center text-lg font-semibold text-gray-800 mb-6">
          {cartCourses.length > 0
            ? `Total Courses: ${cartCourses.length}`
            : "No courses selected"}
        </div>
        <form className="space-y-6">
          <div>
            <label className="block text-gray-700 font-semibold">Name</label>
            <input
              type="text"
              value={currentUser?.username || ""}
              disabled
              className="w-full p-3 border rounded-lg bg-gray-100 text-gray-700"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold">Country</label>
            <select className="w-full p-3 border rounded-lg text-gray-700">
              <option>Select Country</option>
              <option>Canada</option>
              <option>United States</option>
              <option>India</option>
              {/* Add more countries */}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-semibold">Card Details</label>
            <input
              type="text"
              placeholder="Card Number"
              className="w-full p-3 border rounded-lg text-gray-700 mb-3"
            />
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="MM / YY"
                className="w-1/2 p-3 border rounded-lg text-gray-700"
              />
              <input
                type="text"
                placeholder="CVC"
                className="w-1/2 p-3 border rounded-lg text-gray-700"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700"
          >
            Buy Now
          </button>
        </form>
      </div>
    </div>
  );
}

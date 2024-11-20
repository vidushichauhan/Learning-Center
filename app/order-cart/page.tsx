"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useRouter } from "next/navigation";
import Modal from "./PurchaseModal";
 // Import the Modal component

interface Course {
  courseId: string;
  courseName: string;
  price: number;
  description?: string;
}

export default function OrderCart() {
  const { currentUser } = useAuth();
  const [cartCourses, setCartCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false); // State for modal
  const router = useRouter();

  useEffect(() => {
    if (currentUser) {
      setLoading(true);
      fetch(`http://localhost:4000/api/orders/cart/${currentUser.id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(" ");
          }
          return response.json();
        })
        .then((data) => {
          setCartCourses(data);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [currentUser]);

  const handleRemoveCourse = async (courseId: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/orders/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUser?.id, courseId }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to remove course from cart");
      }
  
      // Update the cartCourses state to reflect the removed item
      setCartCourses(cartCourses.filter((course) => course.courseId !== courseId));
    } catch (err) {
      console.error("Error removing course:", err);
      setError("Failed to remove course from cart.");
    }
  };
  
  const handleBuyNow = async () => {
    if (cartCourses.length === 0) {
      alert("Your cart is empty. Add courses to proceed.");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/orders/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: currentUser?.id }),
      });

      if (response.ok) {
        setShowModal(true); // Show modal on success
        setCartCourses([]); // Clear the cart locally
      } else {
        alert("Checkout failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during checkout:", err);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  const handleModalClose = () => setShowModal(false); // Close the modal

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen mt-20">
      {/* Main Container */}
      <div className="flex flex-wrap">
        {/* Left Section: Cart Items */}
        <div className="w-full lg:w-1/2 bg-gray-100 p-8">
          <h2 className="text-3xl font-bold mb-6">Checkout</h2>
          {error && <p className="text-red-500">{error}</p>}
          {cartCourses.length > 0 ? (
            cartCourses.map((course) => (
              <div
                key={course.courseId}
                className="mb-6 p-4 border rounded-lg bg-white shadow-md"
              >
                <h3 className="text-xl font-semibold">{course.courseName}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {course.description || "No description available."}
                </p>
                <p className="text-green-600 font-semibold mt-2">
                  Price: ${course.price ? course.price.toFixed(2) : "0.00"}
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
            ))
          ) : (
            <div className="text-center">
              <p className="text-gray-600">Your cart is empty.</p>
              <button
                onClick={() => router.push("/")}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {/* Right Section: Checkout Form */}
        <div className="w-full lg:w-1/2 bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-center">Order Summary</h2>
          <div className="text-center text-lg font-semibold text-gray-800 mb-6">
            {cartCourses.length > 0
              ? `Total Courses: ${cartCourses.length}`
              : "No courses selected"}
          </div>
          <div className="text-lg font-semibold text-gray-800 mt-6">
            Total Price: $
            {cartCourses.reduce((sum, course) => sum + course.price, 0).toFixed(2)}
          </div>
          <button
            type="button"
            onClick={handleBuyNow}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700 mt-6"
          >
            Buy Now
          </button>
        </div>
      </div>

      {/* Modal */}
      <Modal
        show={showModal}
        message="Purchase successful! Your courses are now available."
        onClose={handleModalClose}
      />
    </div>
  );
}

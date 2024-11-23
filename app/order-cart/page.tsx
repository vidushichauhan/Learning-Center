"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { useRouter } from "next/navigation";
import Modal from "./PurchaseModal";
import Footer from "../components/Footer";

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
  const [showModal, setShowModal] = useState(false);

  // Card Details State
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");

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

      setCartCourses(cartCourses.filter((course) => course.courseId !== courseId));
    } catch (err) {
      console.error("Error removing course:", err);
      setError("Failed to remove course from cart.");
    }
  };

  const handleBuyNow = async () => {
    // Validate card details
    if (!validateCardDetails()) {
      alert("Invalid card details. Please check and try again.");
      return;
    }

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
        setShowModal(true);
        setCartCourses([]);
      } else {
        alert("Checkout failed. Please try again.");
      }
    } catch (err) {
      console.error("Error during checkout:", err);
      alert("An error occurred during checkout. Please try again.");
    }
  };

  const validateCardDetails = () => {
    const cardNumberRegex = /^\d{16}$/;
    const expiryDateRegex = /^(0[1-9]|1[0-2])\/\d{2}$/; // Format MM/YY
    const cvvRegex = /^\d{3,4}$/;

    if (!cardNumberRegex.test(cardNumber)) {
      alert("Invalid card number. It must be 16 digits.");
      return false;
    }
    if (!expiryDateRegex.test(expiryDate)) {
      alert("Invalid expiry date. Use MM/YY format.");
      return false;
    }
    if (!cvvRegex.test(cvv)) {
      alert("Invalid CVV. It must be 3 or 4 digits.");
      return false;
    }
    return true;
  };

  const handleModalClose = () => setShowModal(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-xl text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <><div className="flex flex-col min-h-screen mt-20 bg-gray-50">
    <div className="flex flex-wrap p-6 justify-center">
      {/* Left Section */}
      <div className="w-2/3 h-full bg-white p-8 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold mb-4 text-gray-800">Checkout</h2>
        <p className="text-red-600 font-medium mb-6">
          Hurry up! Limited-time discounts on courses.
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {cartCourses.length > 0 ? (
          cartCourses.map((course) => (
            <div
              key={course.courseId}
              className="flex items-center justify-between mb-6 p-4 border rounded-lg bg-gray-50 shadow-sm"
            >
              {/* Course Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {course.courseName}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {course.description || "No description available."}
                </p>
                <p className="text-green-600 font-semibold mt-2">
                  Price: ${course.price ? course.price.toFixed(2) : "0.00"}
                </p>
              </div>
              {/* Remove Button */}
              <button
                onClick={() => handleRemoveCourse(course.courseId)}
                className="text-red-600 font-medium hover:text-red-800 hover:underline"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <div className="text-center mt-6">
            <p className="text-gray-600">Your cart is empty.</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Browse Courses
            </button>
          </div>
        )}
      </div>
 
  
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg mx-auto">
  <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
    Order Summary
  </h2>
  <p className="text-center text-gray-700 text-lg mb-6">
    Complete your purchase to start learning today!
  </p>
  <p className="text-xl font-semibold text-gray-800 mt-6 mb-8 text-center">
    Total Price: $
    {cartCourses.reduce((sum, course) => sum + course.price, 0).toFixed(2)}
  </p>
  <div className="space-y-6">
    <input
      type="text"
      placeholder="Card Number"
      value={cardNumber}
      onChange={(e) => setCardNumber(e.target.value)}
      className="border border-gray-300 rounded-md px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <div className="flex space-x-6">
      <input
        type="text"
        placeholder="MM/YY"
        value={expiryDate}
        onChange={(e) => setExpiryDate(e.target.value)}
        className="border border-gray-300 rounded-md px-4 py-3 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <input
        type="text"
        placeholder="CVV"
        value={cvv}
        onChange={(e) => setCvv(e.target.value)}
        className="border border-gray-300 rounded-md px-4 py-3 w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  </div>
  <button
    onClick={handleBuyNow}
    className="w-full bg-blue-600 text-white py-4 rounded-md font-bold text-lg mt-8 hover:bg-blue-700 transition-colors"
  >
    Buy Now
  </button>
</div>


      </div>
      {/* Modal */}
      <Modal
        show={showModal}
        message="Purchase successful! Your courses are now available."
        onClose={handleModalClose} />
        <Footer />
    </div>
    </>
  );
}

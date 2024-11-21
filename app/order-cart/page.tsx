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
      <div className="flex flex-wrap p-6">
        {/* Left Section */}
        <div className="w-full lg:w-1/2 bg-gray-100 p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold mb-4">Checkout</h2>
          <p className="text-red-600 font-medium">Hurry up! Limited-time discounts on courses.</p>
          {error && <p className="text-red-500">{error}</p>}
          {cartCourses.length > 0 ? (
            cartCourses.map((course) => (
              <div
                key={course.courseId}
                className="mb-6 p-4 border rounded-lg bg-white shadow-sm"
              >
                <h3 className="text-xl font-semibold">{course.courseName}</h3>
                <p className="text-sm text-gray-600 mt-2">
                  {course.description || "No description available."}
                </p>
                <p className="text-green-600 font-semibold mt-2">
                  Price: ${course.price ? course.price.toFixed(2) : "0.00"}
                </p>
                <button
                  onClick={() => handleRemoveCourse(course.courseId)}
                  className="mt-2 text-red-600 hover:underline"
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
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Browse Courses
              </button>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="w-full lg:w-1/2 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Order Summary</h2>
          <div className="text-center text-lg font-semibold text-gray-800 mb-4">
            Complete your purchase to start learning today!
          </div>
          <p className="text-lg font-semibold text-gray-800 mt-4">
            Total Price: $
            {cartCourses.reduce((sum, course) => sum + course.price, 0).toFixed(2)}
          </p>
          <div className="mt-4 space-y-4">
            <input
              type="text"
              placeholder="Card Number (16 digits)"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="border p-2 rounded-lg w-full" />
            <div className="flex space-x-4">
              <input
                type="text"
                placeholder="MM/YY"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="border p-2 rounded-lg w-1/2" />
              <input
                type="text"
                placeholder="CVV"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                className="border p-2 rounded-lg w-1/2" />
            </div>
          </div>
          <button
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
        onClose={handleModalClose} />
        <Footer />
    </div>
    </>
  );
}

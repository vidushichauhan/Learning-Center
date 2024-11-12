// app/order-cart/page.tsx

"use client"; // Mark this as a Client Component

import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

interface Course {
  courseId: string;
  courseName: string;
  quantity: number;
}

export default function OrderCart() {
  const { currentUser } = useAuth();
  const [cartCourses, setCartCourses] = useState<Course[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      fetch(`http://localhost:4000/api/orders/cart/${currentUser.id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch cart items');
          }
          return response.json();
        })
        .then(data => setCartCourses(data))
        .catch(err => setError(err.message));
    }
  }, [currentUser]);

  const handleQuantityChange = async (courseId: string, change: number) => {
    const updatedCourses = cartCourses.map(course =>
      course.courseId === courseId
        ? { ...course, quantity: course.quantity + change }
        : course
    );

    const targetCourse = updatedCourses.find(course => course.courseId === courseId);
    if (targetCourse && targetCourse.quantity < 1) {
      // Remove item if quantity goes below 1
      await handleRemoveCourse(courseId);
    } else {
      setCartCourses(updatedCourses);
      // Update quantity in backend
      await fetch(`http://localhost:4000/api/orders/update-quantity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser?.id, courseId, quantity: targetCourse?.quantity }),
      });
    }
  };

  const handleRemoveCourse = async (courseId: string) => {
    try {
      await fetch(`http://localhost:4000/api/orders/remove`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser?.id, courseId }),
      });

      // Remove from frontend state
      setCartCourses(cartCourses.filter(course => course.courseId !== courseId));
    } catch (err) {
      console.error('Failed to remove course:', err);
      setError('Failed to remove course from cart');
    }
  };

  const handleBuyNow = () => {
    alert(`Proceeding to purchase for all courses in the cart`);
    // Implement further purchase logic here (API call or further navigation)
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Order Cart</h2>
      {error ? (
        <p className="text-center text-red-500">Error: {error}</p>
      ) : cartCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
          {cartCourses.map(course => (
            <div key={course.courseId} className="p-4 border rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{course.courseName}</h3>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleQuantityChange(course.courseId, -1)}
                    className="px-2 py-1 bg-gray-200 rounded-l"
                    disabled={course.quantity === 1} // Disable if quantity is 1
                  >
                    -
                  </button>
                  <span className="px-4">{course.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(course.courseId, 1)}
                    className="px-2 py-1 bg-gray-200 rounded-r"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => handleRemoveCourse(course.courseId)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={handleBuyNow}
            className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-bold text-lg hover:bg-blue-700"
          >
            Buy Now
          </button>
        </div>
      ) : (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      )}
    </div>
  );
}

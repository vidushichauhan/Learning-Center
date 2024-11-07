// app/order-cart/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';

interface Course {
  id: number;
  name: string;
  description: string;
}

export default function OrderCart() {
  const { currentUser } = useAuth();
  const [cartCourses, setCartCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Fetch the cart items from the backend or local storage
    const storedCart = localStorage.getItem('cartCourses');
    if (storedCart) {
      setCartCourses(JSON.parse(storedCart));
    }
  }, []);

  const handleBuyNow = (courseId: number) => {
    alert(`Proceeding to purchase for course ID: ${courseId}`);
    // Implement purchase logic here (API call or further navigation)
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold mb-6 text-center">Your Order Cart</h2>
      {cartCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
          {cartCourses.map((course) => (
            <div key={course.id} className="p-4 border rounded-lg shadow-md">
              <h3 className="text-xl font-semibold">{course.name}</h3>
              <p className="text-gray-600">{course.description}</p>
              <button
                onClick={() => handleBuyNow(course.id)}
                className="mt-4 w-full bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              >
                Buy Now
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">Your cart is empty.</p>
      )}
    </div>
  );
}

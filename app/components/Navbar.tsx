// app/components/Navbar.tsx

"use client";

import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { currentUser } = useAuth();
  const router = useRouter();

  const handleOrderCartClick = () => {
    router.push('/order-cart'); // Navigate to order cart page
  };

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto p-4">
        <a href="/" className="text-2xl font-semibold text-blue-700">Learning Center</a>
        <div className="flex items-center space-x-4">
          {currentUser && currentUser.role === 'student' && (
            <button
              onClick={handleOrderCartClick}
              className="text-white bg-blue-600 p-2 rounded-lg hover:bg-blue-700"
            >
              Order Cart
            </button>
          )}
          {currentUser ? (
            <button className="text-white bg-blue-600 p-2 rounded-lg">{currentUser.username}</button>
          ) : (
            <a href="/signup" className="text-white bg-blue-600 p-2 rounded-lg">Sign Up</a>
          )}
        </div>
      </div>
    </nav>
  );
}

// app/components/Navbar.tsx

"use client";

import React from 'react';
import { useAuth } from '../AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleOrderCartClick = () => {
    router.push('/order-cart'); // Navigate to order cart page
  };

  const handleLogout = () => {
    logout(); // Call the logout function from AuthContext
    router.push('/'); // Redirect to the homepage or login page
  };

  // Generate initials for the avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0].toUpperCase())
      .join('');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600 p-4">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto">
        <a href="/" className="text-2xl font-semibold text-blue-700">Learning Center</a>
        <div className="flex items-center space-x-4">
          {currentUser && currentUser.role === 'student' && (
            <button
              onClick={handleOrderCartClick}
              className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Order Cart
            </button>
          )}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              {/* Avatar */}
              <div className="bg-blue-500 text-white font-bold w-10 h-10 flex items-center justify-center rounded-full">
                {getInitials(currentUser.username)}
              </div>
              {/* Username */}
              <span className="text-lg font-medium text-blue-700">{currentUser.username}</span>
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          ) : (
            <a href="/signup" className="text-white bg-blue-600 px-4 py-2 rounded-lg">Sign Up</a>
          )}
        </div>
      </div>
    </nav>
  );
}

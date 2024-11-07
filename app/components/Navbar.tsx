// app/components/Navbar.tsx

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { currentUser, setCurrentUser } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    // Clear user data
    setCurrentUser(null);
    localStorage.removeItem('currentUser');

    // Redirect to login page
    router.push('/signup');
  };

  return (
    <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="https://flowbite.com/docs/images/logo.svg"
            className="h-8"
            alt="Flowbite Logo"
          />
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Learning Center
          </span>
        </a>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse relative">
          {currentUser ? (
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2"
            >
              {currentUser.username}
            </button>
          ) : (
            <a href="/signup" className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-4 py-2">
              Sign Up
            </a>
          )}
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white shadow-md rounded-lg py-2">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

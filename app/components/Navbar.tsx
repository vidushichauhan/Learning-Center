// app/components/Navbar.tsx

"use client";

import React from 'react';
import { useAuth } from '../AuthContext'; // Adjust if your context file location is different

export default function Navbar() {
  const { currentUser } = useAuth();

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
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          {currentUser ? (
            <span className="text-white bg-blue-700 px-4 py-2 rounded-lg">
              {currentUser.username}
            </span>
          ) : (
            <a href="/signup" className="text-white bg-blue-700 px-4 py-2 rounded-lg">
              Sign Up
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

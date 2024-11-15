"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  useEffect(() => {
    // Retrieve the profile image from localStorage on load
    const storedImage = localStorage.getItem("profileImage");
    if (storedImage) {
      setProfileImage(storedImage);
    }
  }, []);

  const handleOrderCartClick = () => {
    router.push("/order-cart");
  };

  const handleLogout = () => {
    logout();
    router.push("/");
    localStorage.removeItem("profileImage"); // Remove profile image from localStorage
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        setProfileImage(base64Image); // Update profile image in the component state
        localStorage.setItem("profileImage", base64Image); // Store in localStorage
      };
      reader.readAsDataURL(file);
    }
  };

  // Generate initials for the avatar if no profile image exists
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500 fixed w-full z-20 top-0 left-0 p-4 transition-colors duration-500">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto">
        {/* Logo */}
        <a
          href="/"
          className="text-2xl font-bold text-white hover:opacity-80 transition-opacity"
        >
          Learning Center
        </a>

        {/* Links */}
        <div className="flex items-center space-x-8 text-white font-medium">
          {currentUser && currentUser.role === "student" && (
            <a
              onClick={handleOrderCartClick}
              className="cursor-pointer hover:underline transition-transform"
            >
              Order Cart
            </a>
          )}

          {currentUser ? (
            <div className="flex items-center space-x-4">
              {/* Profile Section */}
              <div className="relative group">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white text-blue-600 font-bold rounded-full flex items-center justify-center shadow-md">
                    {getInitials(currentUser.username)}
                  </div>
                )}

                {/* Dropdown for changing profile */}
                <div className="absolute hidden group-hover:flex flex-col bg-white text-gray-700 shadow-lg rounded-lg p-2 mt-2 right-0">
                  <label
                    htmlFor="profileImage"
                    className="cursor-pointer hover:text-blue-600 transition"
                  >
                    Change Profile
                  </label>
                  <input
                    type="file"
                    id="profileImage"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfileImageChange}
                  />
                </div>
              </div>

              {/* Username */}
              <span className="hover:text-gray-300 transition-opacity">
                {currentUser.username}
              </span>

              {/* Logout */}
              <a
                onClick={handleLogout}
                className="cursor-pointer hover:underline transition-opacity"
              >
                Logout
              </a>
            </div>
          ) : (
            <a
              href="/signup"
              className="hover:underline transition-opacity"
            >
              Sign Up/Sign In
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}

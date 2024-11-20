"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [editingProfile, setEditingProfile] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileImage(currentUser.profileImage || localStorage.getItem("profileImage") || null);
    }
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    router.push("/");
    localStorage.removeItem("profileImage");
  };

  const handleProfileImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64Image = reader.result as string;
        setProfileImage(base64Image);
        localStorage.setItem("profileImage", base64Image);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async () => {
    const updatedProfile = {
      userId: currentUser?.id,
      username: newUsername,
      profileImage,
    };

    try {
      const response = await fetch("http://localhost:4000/api/update-profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedProfile),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        localStorage.setItem("profileImage", updatedUser.profileImage);
        setEditingProfile(false);
        alert("Profile updated successfully");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      console.error(error);
      alert("Error updating profile");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-500 fixed w-full z-20 top-0 left-0 p-4">
      <div className="max-w-screen-xl flex items-center justify-between mx-auto">
        {/* Application Logo */}
        <a href="/" className="text-2xl font-bold text-white hover:opacity-80 transition-opacity">
          Learning Center
        </a>

        {/* Right Side Navbar */}
        <div className="flex items-center space-x-8 text-white font-medium">
          {currentUser ? (
            <>
              {/* Order Cart for Students Only */}
              {currentUser.role === "student" && (
                <button
                  onClick={() => router.push("/order-cart")}
                  className="hover:underline cursor-pointer"
                >
                  Order Cart
                </button>
              )}

              {/* Profile Section */}
              <div className="relative">
                <div
                  className="w-10 h-10 bg-white text-blue-600 font-bold rounded-full flex items-center justify-center shadow-md cursor-pointer overflow-hidden"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    currentUser.username[0].toUpperCase()
                  )}
                </div>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-lg py-2 text-gray-700 z-10 w-56">
                    {editingProfile ? (
                      <div className="flex flex-col space-y-3 px-4">
                        <label className="text-sm font-medium">
                          Change Username:
                          <input
                            type="text"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            className="border p-2 rounded w-full mt-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </label>
                        <label className="text-sm font-medium">
                          Change Profile Image:
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="mt-1 text-sm text-gray-500"
                          />
                        </label>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleUpdateProfile}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingProfile(false)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300 w-full"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => router.push("/purchased-orders")}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Purchased Orders
                        </button>
                        <button
                          onClick={() => setEditingProfile(true)}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          Edit Profile
                        </button>
                        <hr className="my-2 border-gray-200" />
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                        >
                          Logout
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            // Sign Up/Sign In for Logged-Out Users
            <div className="flex space-x-4">
              <button
                onClick={() => router.push("/signup")}
                className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
              >
                Sign Up/Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

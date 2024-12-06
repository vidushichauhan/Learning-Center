"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import Navbar from "../components/Navbar";
import Player from "lottie-react";
import AnimationData from "../public/Animation1.json";

export default function AuthPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth();

  const [isSignUp, setIsSignUp] = useState(true); // Toggle between SignUp and SignIn

  // Sign Up state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [signUpError, setSignUpError] = useState<string | null>(null);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [signInError, setSignInError] = useState<string | null>(null);

  // Handle Sign Up
  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });

      if (response.ok) {
        const loginResponse = await fetch("http://localhost:4000/api/signin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (loginResponse.ok) {
          const data = await loginResponse.json();
          setCurrentUser({ id: data.user.id, username: data.user.username, role: data.user.role });
          setSignUpError(null);
          console.log("Sign up and login successful");

          // Redirect to main page
          router.push("/");
        } else {
          setSignUpError("Signup successful, but login failed. Please try signing in.");
        }
      } else {
        const data = await response.json();
        setSignUpError(data.error || "Signup failed");
      }
    } catch (err) {
      setSignUpError("Something went wrong");
    }
  };

  // Handle Sign In
  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch("http://localhost:4000/api/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signInEmail, password: signInPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser({ id: data.user.id, username: data.user.username, role: data.user.role });
        setSignInError(null);
        console.log("Sign in successful");

        // Redirect to main page
        router.push("/");
      } else {
        const data = await response.json();
        setSignInError(data.error || "Sign in failed");
      }
    } catch (err) {
      setSignInError("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Auth Page Content */}
      <div className="flex flex-grow items-center justify-center mx-auto w-[90%] sm:w-[70%] lg:w-[50%] mt-10 relative">
        {/* Conditional rendering for Sign Up and Sign In */}
        {isSignUp ? (
          <div className="p-8 shadow-xl rounded-2xl border-gray-200 bg-gray-50 w-full transition-transform transform hover:scale-105">
            <h2 className="text-3xl font-bold mb-4 text-center">Sign Up</h2>
            {signUpError && <p className="text-red-500 mb-4">{signUpError}</p>}
            <form onSubmit={handleSignUp} className="space-y-4">
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="border p-2 rounded-full w-full"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border p-2 rounded-full w-full"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border p-2 rounded-full w-full"
                required
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Sign up as:</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="border p-2 rounded-full w-full"
                  required
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                </select>
              </div>
              <div className="justify-center flex">
                <button
                  type="submit"
                  className="w-[40%] bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700"
                >
                  Sign Up
                </button>
              </div>
            </form>
            <p className="text-center text-sm mt-4">
              Already have an account?{" "}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-blue-600 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        ) : (
          <div className="p-8 shadow-xl rounded-2xl bg-gray-50 w-full transition-transform transform hover:scale-105">
            <h2 className="text-3xl font-bold mb-4 text-center">Sign In</h2>
            {signInError && <p className="text-red-500 mb-4">{signInError}</p>}
            <form onSubmit={handleSignIn} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                className="border p-2 rounded-full w-full"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                className="border p-2 rounded-full w-full"
                required
              />
              <div className="justify-center flex">
                <button
                  type="submit"
                  className="w-[40%] bg-blue-600 text-white py-2 rounded-full hover:bg-blue-700"
                >
                  Sign In
                </button>
              </div>
            </form>
            <p className="text-center text-sm mt-4">
              Don't have an account?{" "}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-blue-600 hover:underline"
              >
                Sign Up
              </button>
            </p>
          </div>
        )}
      </div>

      {/* Lottie Animation */}
      <div className="absolute bottom-5 right-5">
        <Player autoplay loop animationData={AnimationData} style={{ width: "300px", height: "300px" }} />
      </div>
    </div>
  );
}

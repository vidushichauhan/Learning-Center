// app/signup/page.tsx

"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../AuthContext';
import Navbar from '../components/Navbar';

export default function AuthPage() {
  const router = useRouter();
  const { setCurrentUser } = useAuth(); // Access setCurrentUser from context

  // Sign Up state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [signUpError, setSignUpError] = useState<string | null>(null);
  const [signUpSuccess, setSignUpSuccess] = useState<string | null>(null);

  // Sign In state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  const [signInError, setSignInError] = useState<string | null>(null);

  // Handle Sign Up
  const handleSignUp = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, role }),
      });

      if (response.ok) {
        setSignUpSuccess('Signup successful! Please sign in.');
        setSignUpError(null);
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('student');
      } else {
        const data = await response.json();
        setSignUpError(data.error || 'Signup failed');
        setSignUpSuccess(null);
      }
    } catch (err) {
      setSignUpError('Something went wrong');
      setSignUpSuccess(null);
    }
  };

  // Handle Sign In
  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: signInEmail, password: signInPassword }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentUser({ username: data.user.username, role: data.user.role });
        setSignInError(null);
        console.log('Sign in successful');
        
        // Redirect to main page
        router.push('/');
      } else {
        const data = await response.json();
        setSignInError(data.error || 'Sign in failed');
      }
    } catch (err) {
      setSignInError('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Auth Page Content */}
      <div className="flex flex-grow items-center justify-center">
        {/* Sign Up Section */}
        <div className="w-1/2 p-8 border-r border-gray-200 max-w-lg">
          <h2 className="text-3xl font-bold mb-4 text-center">Sign Up</h2>
          {signUpError && <p className="text-red-500 mb-4">{signUpError}</p>}
          {signUpSuccess && <p className="text-green-500 mb-4">{signUpSuccess}</p>}
          <form onSubmit={handleSignUp} className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Sign up as:
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="border p-2 rounded w-full"
                required
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Sign In Section */}
        <div className="w-1/2 p-8 max-w-lg">
          <h2 className="text-3xl font-bold mb-4 text-center">Sign In</h2>
          {signInError && <p className="text-red-500 mb-4">{signInError}</p>}
          <form onSubmit={handleSignIn} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={signInPassword}
              onChange={(e) => setSignInPassword(e.target.value)}
              className="border p-2 rounded w-full"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

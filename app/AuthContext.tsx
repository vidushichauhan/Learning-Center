"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: string;
  username: string;
  role: string;
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void; // Add logout to the context type
  completedModules: string[]; // Add completed modules
  setCompletedModules: React.Dispatch<React.SetStateAction<string[]>>; // Update modules
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  // Check localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    const storedProgress = localStorage.getItem("completedModules");

    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    if (storedProgress) {
      setCompletedModules(JSON.parse(storedProgress));
    }
  }, []);

  // Store user and progress data in localStorage whenever they change
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }

    if (completedModules.length > 0) {
      localStorage.setItem("completedModules", JSON.stringify(completedModules));
    } else {
      localStorage.removeItem("completedModules");
    }
  }, [currentUser, completedModules]);

  // Define the logout function
  const logout = () => {
    setCurrentUser(null); // Clear user from state
    setCompletedModules([]); // Clear progress
    localStorage.removeItem("completedModules");
    localStorage.removeItem("currentUser"); // Clear user from localStorage
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout, completedModules, setCompletedModules }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

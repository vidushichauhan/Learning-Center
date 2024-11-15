"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface User {
  id: string; // Required property
  username: string; // Required property
  role: string; // Required property
  profileImage?: string; // Optional property
}

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  completedModules: string[];
  setCompletedModules: React.Dispatch<React.SetStateAction<string[]>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  // Load user and progress from localStorage
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

  // Save user and progress to localStorage
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

  const logout = () => {
    setCurrentUser(null); // Clear user
    setCompletedModules([]); // Clear progress
    localStorage.removeItem("completedModules");
    localStorage.removeItem("currentUser");
  };

  const updateProfile = (newUsername: string, profileImage?: string) => {
    if (currentUser) {
      const updatedUser: User = {
        id: currentUser.id, // Ensure required properties are retained
        username: newUsername,
        role: currentUser.role, // Ensure role is retained
        profileImage: profileImage || currentUser.profileImage, // Update or keep the existing image
      };
      setCurrentUser(updatedUser);
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        logout,
        completedModules,
        setCompletedModules,
      }}
    >
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

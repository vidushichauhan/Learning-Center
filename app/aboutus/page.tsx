"use client";

import React from "react";
import Player from "lottie-react"; // Ensure lottie-react is installed
import StudentAnimation from "../public/animations/student-learning.json";
import TeacherAnimation from "../public/animations/teacher-teaching.json";
import Footer from "../components/Footer";

const AboutUsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex flex-col mt-16">
      {/* Header Section */}
      <div className="text-center py-10">
        <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600">
          About Us
        </h1>
        <p className="text-lg text-gray-700 max-w-3xl mx-auto mt-4">
          Welcome to the Learning Center! Our mission is to empower students, teachers, and administrators with an interactive platform for learning, collaboration, and growth.
        </p>
      </div>

      {/* Information Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 px-4 md:px-16 py-10">
        {/* For Students */}
        <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6">
          <Player
            autoplay
            loop
            animationData={StudentAnimation}
            style={{ height: "250px", width: "250px" }}
          />
          <h2 className="text-2xl font-semibold text-indigo-600 mt-4">For Students</h2>
          <p className="text-gray-600 text-center mt-2">
            Access a wide range of courses, track your progress, and participate in interactive labs to enhance your learning experience.
          </p>
        </div>

        {/* For Teachers */}
        <div className="flex flex-col items-center bg-white rounded-lg shadow-md p-6">
          <Player
            autoplay
            loop
            animationData={TeacherAnimation}
            style={{ height: "250px", width: "250px" }}
          />
          <h2 className="text-2xl font-semibold text-indigo-600 mt-4">For Teachers</h2>
          <p className="text-gray-600 text-center mt-2">
            Upload learning materials, track student progress, and create engaging labs to facilitate effective teaching.
          </p>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutUsPage;

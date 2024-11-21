"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
}

export default function ContentPage() {
  const { currentUser } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [courseImages, setCourseImages] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    fetch("http://localhost:4000/api/repos")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch repositories");
        }
        return response.json();
      })
      .then((data: Repository[]) => {
        setRepositories(data);
        data.forEach((repo) => fetchCourseImage(repo.name));
      })
      .catch((err) => setError(err.message));
  }, []);

  const fetchCourseImage = async (repoName: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/repos/${repoName}/contents/image`);
      if (!response.ok) {
        throw new Error("Image folder not found");
      }
      const contents = await response.json();
      if (Array.isArray(contents)) {
        const imageFile = contents.find(
          (file: any) => file.type === "file" && (file.name === "image.jpg" || file.name === "download.png")
        );
        const imageUrl = imageFile ? imageFile.download_url : "";
        setCourseImages((prevImages) => ({
          ...prevImages,
          [repoName]: imageUrl,
        }));
      }
    } catch (error) {
      setCourseImages((prevImages) => ({
        ...prevImages,
        [repoName]: "",
      }));
    }
  };

  const addToCart = async (courseId: number, courseName: string, price: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/orders/add-to-cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser?.id,
          username: currentUser?.username,
          courseId,
          courseName,
          price
        }),
      });

      if (response.ok) {
        alert("Course added to cart successfully");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add course to cart");
      }
    } catch (error) {
      alert("An error occurred while adding the course to cart");
    }
  };

  const handleCourseClick = (repoName: string) => {
    router.push(`/course?repoName=${repoName}`);
  };

  const handleEditCourse = (repoName: string) => {
    router.push(`/edit-course?repoName=${repoName}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase();
  };

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className=" bg-gray-50 min-h-screen pt-8">
      
      {/* <input
        type="text"
        placeholder="Search courses..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border border-gray-300 rounded-full p-3 w-full max-w-lg mx-auto mb-8 block shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      /> */}
    <div className="flex items-center gap-3 max-w-lg ml-auto mb-8 justify-end p-4">
        
        <input
          type="text"
          placeholder="What do you want to learn?"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-gray-600 text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
          <button className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.9 14.32a8 8 0 111.414-1.414l4.243 4.243a1 1 0 01-1.414 1.414l-4.243-4.243zM8 14a6 6 0 100-12 6 6 0 000 12z"
                clipRule="evenodd"
              />
            </svg>
          </button>
</div>

<div className="text-left max-w-4xl ml-8 mb-4">
  <p className="text-lg font-semibold text-gray-600 mb-2">Degree Programs</p>
  <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-4">
    Find a top degree that fits your life
  </h1>
  <p className="text-lg text-gray-700">
    Breakthrough pricing on 100% online degrees from top universities.
  </p>
</div>
      {error ? (
        <p className="text-red-500 text-center">Error: {error}</p>
      ) : (
        // <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8">
        //   {filteredRepositories.map((repo) => (
        //     <div
        //       key={repo.id}
        //       className="bg-gray-50 rounded-lg shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl cursor-pointer p-6"
        //       onClick={() => handleCourseClick(repo.name)}
        //     >
        //       {courseImages[repo.name] ? (
        //         <img
        //           src={courseImages[repo.name]}
        //           alt={`${repo.name} cover`}
        //           className="w-full h-48 object-cover rounded"
        //           onError={(e) => {
        //             e.currentTarget.onerror = null;
        //             e.currentTarget.src = "";
        //           }}
        //         />
        //       ) : (
        //         <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded">
        //           <span className="text-5xl font-bold text-gray-400">{getInitials(repo.name)}</span>
        //         </div>
        //       )}

        //       <h2 className="text-xl font-semibold text-blue-600 mt-4">{repo.name}</h2>
        //       <p className="text-gray-600 mt-2">{repo.description || "No description provided."}</p>
        //       <div className="mt-4 text-sm text-gray-500">
        //         ⭐ {repo.stargazers_count} | Forks: {repo.forks_count}
        //       </div>
        //       {currentUser?.role === "student" && (
        //         <button
        //           onClick={(e) => {
        //             e.stopPropagation();
        //             addToCart(repo.id, repo.name);
        //           }}
        //           className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        //         >
        //           Add to Cart
        //         </button>
        //       )}
        //       {currentUser?.role === "teacher" && (
        //         <button
        //           onClick={(e) => {
        //             e.stopPropagation();
        //             handleEditCourse(repo.name);
        //           }}
        //           className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        //         >
        //           Edit Course
        //         </button>
        //       )}
        //     </div>
        //   ))}
        // </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-8">
  {filteredRepositories.map((repo) => (
    <motion.div
      key={repo.id}
      className="bg-gray-50 rounded-lg shadow-lg cursor-pointer p-6"
      onClick={() => handleCourseClick(repo.name)}
      whileHover={{
        scale: 1.05, // Smoothly increases size on hover
        boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.2)", // Adds shadow effect
      }}
      whileTap={{
        scale: 0.95, // Shrinks slightly when clicked
      }}
      transition={{
        duration: 0.3, // Smooth transition duration
      }}
    >
      {courseImages[repo.name] ? (
        <motion.img
          src={courseImages[repo.name]}
          alt={`${repo.name} cover`}
          className="w-full h-48 object-cover rounded"
          initial={{ x: "-10%", opacity: 0 }} // Start from the left with opacity 0
          animate={{ x: 0, opacity: 1 }} // Slide into view with full opacity
          transition={{ duration: 0.8, ease: "easeOut" }} // Smooth transition
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "";
          }}
        />
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded">
          <span className="text-5xl font-bold text-gray-400">{getInitials(repo.name)}</span>
        </div>
      )}

      <h2 className="text-xl font-semibold text-blue-600 mt-4">{repo.name}</h2>
      <p className="text-gray-600 mt-2">{repo.description || "No description provided."}</p>
      <div className="mt-4 text-sm text-gray-500">
        ⭐ {repo.stargazers_count} | Forks: {repo.forks_count}
      </div>

      {currentUser?.role === "student" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(repo.id, repo.name);
          }}
          className="mt-6 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
        >
          Add to Cart
        </button>
      )}
      {currentUser?.role === "teacher" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEditCourse(repo.name);
          }}
          className="mt-6 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Edit Course
        </button>
      )}
    </motion.div>
  ))}
</div>
      )}
            {/* Footer Component */}
            <Footer />
    </div>
  );
}
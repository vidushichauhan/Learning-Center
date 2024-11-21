"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import CourseGrid from "./CourseGrid"; // Import CourseGrid
import Footer from "../components/Footer";
import BannerCarousel from "./BannerCarousel";
import ErrorMessage from "./ErrorMessage";
import Modal from "../order-cart/PurchaseModal";

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  courseImage: string;
}

export default function ContentPage() {
  const { currentUser } = useAuth();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [courseImages, setCourseImages] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  useEffect(() => {
    const fetchPurchasedCourses = async () => {
      if (!currentUser) return;

      try {
        const response = await fetch(
          `http://localhost:4000/api/orders/purchased/${currentUser.id}`
        );
        if (!response.ok) throw new Error("Failed to fetch purchased courses");
        const data = await response.json();
        const purchasedCourseNames = data.map(
          (course: { courseName: any }) => course.courseName
        );
        setPurchasedCourses(purchasedCourseNames);
      } catch (err) {
        console.error(err.message);
      }
    };

    const fetchRepositories = async () => {
      try {
        const repoResponse = await fetch("http://localhost:4000/api/repos");
        if (!repoResponse.ok) throw new Error("Failed to fetch repositories");
        const repos = await repoResponse.json();

        const updatedRepos = await Promise.all(
          repos.map(async (repo: Repository) => {
            const courseImage = await fetchCourseImage(repo.name);
            return {
              ...repo,
              courseImage,
            };
          })
        );

        setRepositories(updatedRepos);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRepositories();
    fetchPurchasedCourses(); // Correctly invoking the function here
  }, [currentUser]); // Re-fetch whenever `currentUser` changes

  const fetchCourseImage = async (repoName: string) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/repos/${repoName}/contents/image`
      );
      console.log("Image API Response:", response);
  
      if (!response.ok) throw new Error("Image folder not found");
  
      const { imageUrl } = await response.json();
      console.log("Image URL:", imageUrl);
  
      // Update courseImages state
      setCourseImages((prevImages) => {
        const updatedImages = { ...prevImages, [repoName]: imageUrl };
        console.log("Updated courseImages state:", updatedImages);
        return updatedImages;
      });
  
      return imageUrl;
    } catch (error) {
      console.error(`Error fetching image for ${repoName}:`, error.message);
      return "";
    }
  };
  
  
  

  const addToCart = async (courseId: number, courseName: string) => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/orders/add-to-cart",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser?.id,
            username: currentUser?.username,
            courseId,
            courseName,
          }),
        }
      );
      alert(
        response.ok
          ? "Course added to cart successfully"
          : "Failed to add course to cart"
      );
    } catch {
      alert("An error occurred while adding the course to cart");
    }
  };

  const handleCourseClick = (repoName: string) => {
    if (currentUser?.role === "teacher" || purchasedCourses.includes(repoName)) {
      // Properly check if the course is purchased
      router.push(`/course?repoName=${repoName}`);
    } else {
      setSelectedCourse(repoName);
      setShowModal(true);
    }
  };

  const handleEditCourse = (repoName: string) =>
    router.push(`/edit-course?repoName=${repoName}`);

  const handleModalClose = () => setShowModal(false);

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description &&
        repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (<>
    <div className="bg-gray-50 min-h-screen pt-8 px-7">
  {/* Hero Section */}
  <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto px-6 mb-8 space-y-6 md:space-y-0">
    {/* Text Content */}
<div className="text-left max-w-md md:mr-auto md:pr-6">
  <p className="text-lg font-semibold text-gray-600 mb-2">Degree Programs</p>
  <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
    Find a top degree that fits your life
  </h1>
  <p className="text-lg text-gray-700">
    Breakthrough pricing on 100% online degrees from top universities.
  </p>
</div>


    {/* Search Bar */}
    <div className="flex items-center gap-5 max-w-lg w-full md:w-full mt-6 md:mt-0">
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
  </div>

  {/* Banner */}
  <div className="mb-8">
    <BannerCarousel />
  </div>

  {/* Course Grid */}
  {error ? (
    <ErrorMessage message={error} />
  ) : (
    <CourseGrid
      repositories={filteredRepositories}
      currentUserRole={currentUser?.role || ""}
      onAddToCart={addToCart}
      onEditCourse={handleEditCourse}
      onCourseClick={handleCourseClick}
      courseImages={courseImages}
    />
  )}

{currentUser?.role === "teacher" && showModal && (
  <Modal
    show={showModal}
    message="You need to purchase this course to view its content."
    onClose={handleModalClose}
  />
)}

</div>
  {/* Footer */}
  <Footer />
</>
  );
}

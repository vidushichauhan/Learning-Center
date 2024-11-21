"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import SearchBar from "./SearchBar";
import ErrorMessage from "./ErrorMessage";
import CourseGrid from "./CourseGrid";
import Modal from "../order-cart/PurchaseModal";
import BannerCarousel from "./BannerCarousel"; // Import the BannerCarousel

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  price: string;
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
  const router = useRouter();

  useEffect(() => {
    const fetchRepositories = async () => {
      try {
        const repoResponse = await fetch("http://localhost:4000/api/repos");
        if (!repoResponse.ok) throw new Error("Failed to fetch repositories");
        const repos = await repoResponse.json();

        const updatedRepos = await Promise.all(
          repos.map(async (repo: Repository) => {
            const { description, price } = await fetchReadme(repo.name);
            const courseImage = await fetchCourseImage(repo.name);
            return {
              ...repo,
              description,
              price,
              courseImage,
            };
          })
        );

        setRepositories(updatedRepos);
      } catch (err) {
        setError(err.message);
      }
    };

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

    fetchRepositories();
    fetchPurchasedCourses();
  }, [currentUser]);

  const fetchReadme = async (repoName: string) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/readme/${repoName}`
      );
      if (!response.ok) throw new Error("Failed to fetch README data");
      const { description, price } = await response.json();
      return { description, price };
    } catch {
      return { description: "No description available", price: "Free" };
    }
  };

  const fetchCourseImage = async (repoName: string) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/repos/${repoName}/contents/image`
      );
      if (!response.ok) throw new Error("Image folder not found");
      const contents = await response.json();
      const imageFile = contents.find(
        (file: any) =>
          file.type === "file" &&
          (file.name === "image.jpg" || file.name === "download.png")
      );
      return imageFile ? imageFile.download_url : "";
    } catch {
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
    if (purchasedCourses.includes(repoName)) {
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

  return (
    <div className="p-6">
      {/* Welcome Message */}
      <h1 className="text-3xl font-bold text-center mb-6">
        Welcome, {currentUser?.username || "Guest"}!
      </h1>

      {/* Banner Carousel */}
      <BannerCarousel />

      {/* Courses Uploaded Section */}
      <h1 className="text-2xl font-bold text-center mt-8 mb-6">
        Courses Uploaded
      </h1>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <CourseGrid
            repositories={filteredRepositories}
            currentUserRole={currentUser?.role || ""}
            onAddToCart={addToCart}
            onEditCourse={handleEditCourse}
            onCourseClick={handleCourseClick} courseImages={{}}        />
      )}

      {showModal && (
        <Modal
          show={showModal}
          message="You need to purchase this course to view its content."
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}

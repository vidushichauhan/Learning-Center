"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext";
import SearchBar from "./SearchBar";
import ErrorMessage from "./ErrorMessage";
import CourseGrid from "./CourseGrid";

interface Repository {
  id: number;
  name: string;
  html_url: string;
  description: string | null;
  price: string; // Add price field
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
              courseImage, // Include image in repository object
            };
          })
        );

        setRepositories(updatedRepos);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchRepositories();
  }, []);

  const fetchReadme = async (repoName: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/readme/${repoName}`);
      if (!response.ok) throw new Error("Failed to fetch README data");
      const { description, price } = await response.json();
      return { description, price };
    } catch {
      return { description: "No description available", price: "Free" };
    }
  };

  const fetchCourseImage = async (repoName: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/repos/${repoName}/contents/image`);
      if (!response.ok) throw new Error("Image folder not found");
      const contents = await response.json();
      const imageFile = contents.find(
        (file: any) => file.type === "file" && (file.name === "image.jpg" || file.name === "download.png")
      );
      return imageFile ? imageFile.download_url : "";
    } catch {
      return "";
    }
  };

  const addToCart = async (courseId: number, courseName: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/orders/add-to-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser?.id, username: currentUser?.username, courseId, courseName }),
      });
      alert(response.ok ? "Course added to cart successfully" : "Failed to add course to cart");
    } catch {
      alert("An error occurred while adding the course to cart");
    }
  };

  const handleCourseClick = (repoName: string) => router.push(`/course?repoName=${repoName}`);
  const handleEditCourse = (repoName: string) => router.push(`/edit-course?repoName=${repoName}`);

  const filteredRepositories = repositories.filter(
    (repo) =>
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Courses Uploaded</h1>
      <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
      {error ? (
        <ErrorMessage message={error} />
      ) : (
        <CourseGrid
          repositories={filteredRepositories}
          currentUserRole={currentUser?.role || ""}
          courseImages={courseImages}
          onAddToCart={addToCart}
          onEditCourse={handleEditCourse}
          onCourseClick={handleCourseClick}
        />
      )}
    </div>
  );
}

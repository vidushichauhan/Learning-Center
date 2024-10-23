import Navbar from "./components/Navbar";
import ContentPage from "./content/ContentPage";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <div className="h-16">
        <Navbar />
      </div>

      {/* Content Section */}
      <div className="flex-grow">
        <ContentPage />
      </div>
    </div>
  );
}

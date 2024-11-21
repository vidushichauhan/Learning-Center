import { useEffect, useState } from "react";

const banners = [
  {
    id: 1,
    imageUrl: "https://img-c.udemycdn.com/notices/web_carousel_slide/image/e6cc1a30-2dec-4dc5-b0f2-c5b656909d5b.jpg",
    altText: "50% Off on All Courses!",
  },
  {
    id: 2,
    imageUrl: "https://as2.ftcdn.net/v2/jpg/09/30/36/77/1000_F_930367704_ggNEUc0O8pmG78qNZWhPVVHk9KtFuq7V.jpg",
    altText: "New Courses Added Weekly!",
  },
  {
    id: 3,
    imageUrl: "https://i.pinimg.com/736x/9b/70/de/9b70de601f8d715cb258756b997313df.jpg",
    altText: "Earn Rewards by Referring Friends!",
  },
];

const BannerCarousel = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prevBanner) => (prevBanner + 1) % banners.length);
    }, 5000); // Rotate banners every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setCurrentBanner((prevBanner) => (prevBanner + 1) % banners.length);
  };

  const handlePrevious = () => {
    setCurrentBanner((prevBanner) =>
      prevBanner === 0 ? banners.length - 1 : prevBanner - 1
    );
  };

  return (
    <div className="relative w-full h-56 md:h-72 lg:h-96 overflow-hidden rounded-lg shadow-lg mb-8">
      {/* Banner Images */}
      {banners.map((banner, index) => (
        <img
          key={banner.id}
          src={banner.imageUrl}
          alt={banner.altText}
          className={`absolute top-0 left-0 w-full h-full object-cover transition-opacity duration-1000 ${
            index === currentBanner ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Banner Text */}
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent text-white px-6 py-4">
        <h2 className="text-lg md:text-2xl font-bold">
          {banners[currentBanner].altText}
        </h2>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrevious}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5L8.25 12l7.5-7.5"
          />
        </svg>
      </button>
      <button
        onClick={handleNext}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-gray-700"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 19.5L15.75 12l-7.5-7.5"
          />
        </svg>
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <span
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentBanner
                ? "bg-white"
                : "bg-gray-400 hover:bg-white cursor-pointer"
            }`}
            onClick={() => setCurrentBanner(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;

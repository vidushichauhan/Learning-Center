import { useEffect, useState } from "react";

const banners = [
  {
    id: 1,
    imageUrl: "https://img-c.udemycdn.com/notices/web_carousel_slide/image/e6cc1a30-2dec-4dc5-b0f2-c5b656909d5b.jpg", // Correct path
    altText: "50% Off on All Courses!",
  },
  {
    id: 2,
    imageUrl: "https://as2.ftcdn.net/v2/jpg/09/30/36/77/1000_F_930367704_ggNEUc0O8pmG78qNZWhPVVHk9KtFuq7V.jpg", // Correct path
    altText: "New Courses Added Weekly!",
  },
  {
    id: 3,
    imageUrl: "https://i.pinimg.com/736x/9b/70/de/9b70de601f8d715cb258756b997313df.jpg", // Correct path
    altText: "Earn Rewards by Referring Friends!",
  },
];

const BannerCarousel = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prevBanner) => (prevBanner + 1) % banners.length);
    }, 3000); // Rotate banners every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-56 md:h-72 lg:h-96 overflow-hidden rounded-lg shadow-lg mb-8">
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
      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black to-transparent text-white p-4">
        <h2 className="text-lg md:text-2xl font-bold">
          {banners[currentBanner].altText}
        </h2>
      </div>
    </div>
  );
};

export default BannerCarousel;

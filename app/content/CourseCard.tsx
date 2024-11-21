interface Repository {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
  }
  
interface CourseCardProps {
    repo: Repository;
    currentUserRole: string;
    courseImage: string | undefined;
    onAddToCart: (courseId: number, courseName: string) => void;
    onEditCourse: (repoName: string) => void;
    onCourseClick: (repoName: string) => void;
  }
  
  const CourseCard = ({
    repo,
    currentUserRole,
    courseImage,
    onAddToCart,
    onEditCourse,
    onCourseClick,
  }: CourseCardProps) => {
    const getInitials = (name: string) =>
      name
        .split(" ")
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();
  
    return (
      <div
      className="p-6 border border-gray-200 rounded-xl shadow-md hover:shadow-2xl hover:scale-105 transition-all cursor-pointer bg-gradient-to-b from-white to-gray-50"
        onClick={() => onCourseClick(repo.name)}
      >
        {/* Course Image or Initial */}
        {courseImage ? (
          <img
            src={courseImage}
            alt={`${repo.name} cover`}
            className="w-full h-40 object-cover rounded"
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center bg-gray-200 rounded">
            <span className="text-5xl font-bold text-gray-500">
              {getInitials(repo.name)}
            </span>
          </div>
        )}
  
        {/* Course Details */}
        <h2 className="text-lg font-semibold text-blue-700 mt-4 truncate">
          {repo.name}
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          {repo.description || "No description provided."}
        </p>
  
        {/* Stars and Forks */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
          <span>⭐ {repo.stargazers_count}</span>
          <span>Forks: {repo.forks_count}</span>
        </div>
  
        {/* Add to Cart or Edit Buttons */}
        {currentUserRole === "student" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(repo.id, repo.name);
            }}
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            Add to Cart
          </button>
        )}
        {currentUserRole === "teacher" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditCourse(repo.name);
            }}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
          >
            Edit
          </button>
        )}
      </div>
    );
  };
  
  
  
  export default CourseCard;
  
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
      name.split(' ').map((word) => word.charAt(0)).join('').toUpperCase();
  
    return (
      <div
        key={repo.id}
        className="p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => onCourseClick(repo.name)}
      >
        {courseImage ? (
          <img
            src={courseImage}
            alt={`${repo.name} cover`}
            className="w-full h-40 object-cover rounded"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = ''; // Trigger fallback
            }}
          />
        ) : (
          <div className="w-full h-40 flex items-center justify-center bg-gray-200 rounded">
            <span className="text-4xl font-bold text-gray-500">{getInitials(repo.name)}</span>
          </div>
        )}
  
        <h2 className="text-xl font-semibold text-blue-600 mt-4">{repo.name}</h2>
        <p className="mt-2 text-gray-700">{repo.description || 'No description provided.'}</p>
        <div className="mt-4 text-sm text-gray-500">
          ⭐ {repo.stargazers_count} | Forks: {repo.forks_count}
        </div>
        {currentUserRole === 'student' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(repo.id, repo.name);
            }}
            className="mt-4 bg-blue-600 text-white p-2 rounded"
          >
            Add to Cart
          </button>
        )}
        {currentUserRole === 'teacher' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditCourse(repo.name);
            }}
            className="mt-4 bg-green-600 text-white p-2 rounded"
          >
            Edit
          </button>
        )}
      </div>
    );
  };
  
  export default CourseCard;
  
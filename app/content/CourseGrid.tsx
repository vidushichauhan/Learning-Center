import CourseCard from "./CourseCard";
interface Repository {
    id: number;
    name: string;
    html_url: string;
    description: string | null;
    stargazers_count: number;
    forks_count: number;
  }
  
interface CourseGridProps {
    repositories: Repository[];
    currentUserRole: string;
    courseImages: { [key: string]: string };
    onAddToCart: (courseId: number, courseName: string) => void;
    onEditCourse: (repoName: string) => void;
    onCourseClick: (repoName: string) => void;
  }
  
  const CourseGrid = ({
    repositories,
    currentUserRole,
    courseImages,
    onAddToCart,
    onEditCourse,
    onCourseClick,
  }: CourseGridProps) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {repositories.map((repo) => (
        <CourseCard
          key={repo.id}
          repo={repo}
          currentUserRole={currentUserRole}
          courseImage={courseImages[repo.name]}
          onAddToCart={onAddToCart}
          onEditCourse={onEditCourse}
          onCourseClick={onCourseClick}
        />
      ))}
    </div>
  );
  
  export default CourseGrid;
  
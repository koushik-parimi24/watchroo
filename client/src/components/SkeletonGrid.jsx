import MovieCard from "./MovieCard";

const SkeletonGrid = ({ count = 12, className = "" }) => {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 ${className}`}>
      {Array.from({ length: count }, (_, index) => (
        <MovieCard key={`skeleton-${index}`} isLoading={true} />
      ))}
    </div>
  );
};

export default SkeletonGrid;

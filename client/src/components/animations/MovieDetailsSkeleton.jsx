// components/MovieDetailsSkeleton.jsx
import Skeleton from "react-loading-skeleton";

const MovieDetailsSkeleton = () => {
  return (
    <div className="p-6 text-foreground mx-auto pt-24 min-h-screen">
      <div className="flex flex-col gap-6">
        {/* Title and Button */}
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-10 w-60" />
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Player */}
        <Skeleton className="w-full aspect-video" />

        {/* Info Section */}
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          <Skeleton className="w-48 h-72 rounded" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-6 space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-6 w-full" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailsSkeleton;

const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-zinc-700 rounded-md ${className}`} />
  );
};

export default Skeleton;
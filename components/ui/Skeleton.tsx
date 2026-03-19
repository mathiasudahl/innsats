interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ backgroundColor: "var(--border)" }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div
      className="rounded-2xl shadow-sm p-4"
      style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-8 w-2/3 mb-2" />
      <Skeleton className="h-3 w-full mb-1" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

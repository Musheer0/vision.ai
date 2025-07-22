export const VisionCardSkeleton = () => {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="animate-pulse">
        {/* Gradient placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40 rounded-xl" />

        {/* Content skeleton */}
        <div className="relative z-10 space-y-4">
          <div className="h-6 bg-muted rounded-md w-3/4" />
          <div className="space-y-2">
            <div className="h-4 bg-muted/70 rounded w-1/2" />
            <div className="h-4 bg-muted/70 rounded w-1/3" />
          </div>
        </div>
      </div>
    </div>
  )
}

export const VisionGridSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <VisionCardSkeleton key={index} />
      ))}
    </div>
  )
}

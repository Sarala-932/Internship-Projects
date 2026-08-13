export default function CardSkeleton({ count = 3 }) {
  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-700 animate-pulse w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          
          {/* Date Box Skeleton */}
          <div className="w-20 h-20 rounded-2xl bg-slate-200 dark:bg-slate-700 shrink-0"></div>

          {/* Details Skeleton */}
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 w-full">
                <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4 max-w-62.5"></div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-1/2 max-w-37.5"></div>
              </div>
              <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
            </div>
            
            <div className="flex gap-4">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-24"></div>
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-md w-32"></div>
            </div>
          </div>

          {/* Actions Skeleton */}
          <div className="w-full sm:w-24 h-9 bg-slate-200 dark:bg-slate-700 rounded-xl mt-4 sm:mt-0"></div>
        </div>
      ))}
    </div>
  );
}

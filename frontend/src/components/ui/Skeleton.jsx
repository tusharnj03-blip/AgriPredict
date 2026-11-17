import React from 'react'

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={`animate-pulse bg-[#E5E9E3] rounded ${className}`.trim()}
      {...props}
    />
  )
}

export default Skeleton

export function MetricCardSkeleton({ className = '', ...props }) {
  return (
    <div className={`card p-4 space-y-3 ${className}`.trim()} {...props}>
      <div className="flex justify-between items-center">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-7 w-20" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function CardSkeleton({ className = '', ...props }) {
  return (
    <div className={`card p-5 space-y-3 ${className}`.trim()} {...props}>
      <Skeleton className="h-4 w-36" />
      <Skeleton className="h-3 w-64" />
      <div className="pt-2 space-y-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export function ContentSkeleton({ className = '', ...props }) {
  return (
    <div className={`space-y-4 ${className}`.trim()} {...props}>
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-96" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5, cols = 4, className = '', ...props }) {
  return (
    <div className={`w-full space-y-2 ${className}`.trim()} {...props}>
      <div className="flex gap-4 p-2 bg-[#F7F8F4] rounded">
        {Array(cols).fill(0).map((_, i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
      {Array(rows).fill(0).map((_, i) => (
        <div key={i} className="flex gap-4 p-3 border-b border-[#F0F3EF]">
          {Array(cols).fill(0).map((_, j) => (
            <Skeleton key={j} className="h-3 flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

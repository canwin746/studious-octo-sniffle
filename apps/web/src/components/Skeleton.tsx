interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
}

export function Skeleton({ className = '', variant = 'text', width, height }: SkeletonProps) {
  const baseClass = 'skeleton'
  
  const variantClass = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }[variant]

  const style: React.CSSProperties = {
    width: width,
    height: height
  }

  return (
    <div 
      className={`${baseClass} ${variantClass} ${className}`} 
      style={style}
    />
  )
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className="fade-in">
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b flex justify-between items-center">
          <Skeleton width={120} height={24} />
          <Skeleton width={100} height={36} variant="rectangular" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                {Array.from({ length: columns }).map((_, i) => (
                  <th key={i} className="py-3 px-4">
                    <Skeleton width={80} height={16} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {Array.from({ length: columns }).map((_, colIndex) => (
                    <td key={colIndex} className="py-3 px-4">
                      <Skeleton 
                        width={colIndex === 0 ? 120 : 80} 
                        height={16} 
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 fade-in">
      <div className="flex items-center space-x-4 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1">
          <Skeleton width={120} height={20} className="mb-2" />
          <Skeleton width={80} height={14} />
        </div>
      </div>
      <Skeleton width="100%" height={100} variant="rectangular" className="mb-4" />
      <div className="flex justify-between">
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
        <Skeleton width={60} height={24} />
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="space-y-4 fade-in">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i}>
          <Skeleton width={80} height={16} className="mb-2" />
          <Skeleton width="100%" height={40} variant="rectangular" />
        </div>
      ))}
      <Skeleton width="100%" height={40} variant="rectangular" />
    </div>
  )
}

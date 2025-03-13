import React from 'react'

const GraphSkeleton = () => {
    return (
      <div className="p-6 bg-white rounded-lg shadow-md lg:mt-8 space-y-8 animate-pulse">
        {/* Header */}
        <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
  
        {/* Year Selector */}
        <div className="mb-6 flex items-center gap-4">
          <div className="h-6 bg-gray-200 rounded w-24"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
  
        {/* Chart Grid */}
        <div className="flex flex-col md:flex-row md:gap-8">
          {/* Bar Chart Skeleton */}
          <div className="mb-8 md:flex-1">
            <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="w-full h-96 bg-gray-100 rounded-lg"></div>
          </div>
  
          {/* Line Chart Skeleton */}
          <div className="mb-8 md:flex-1">
            <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="w-full h-96 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  };
  
export default GraphSkeleton;
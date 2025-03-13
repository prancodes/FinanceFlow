import React from 'react';

const HomeSkeleton = () => {
  return (
    <div className="min-h-screen md:mt-7 bg-white flex flex-col animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="h-96 bg-gray-200 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto"></div>
          <div className="flex gap-4 justify-center">
            <div className="h-10 bg-gray-300 rounded w-32"></div>
            <div className="h-10 bg-gray-300 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* Stats Section Skeleton */}
      <div className="p-6 bg-blue-50 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-4 text-center">
            <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        ))}
      </div>

      {/* Features Section Skeleton */}
      <div className="p-8">
        <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-6 space-y-4">
              <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto"></div>
              <div className="h-5 bg-gray-200 rounded w-1/2 mx-auto"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HomeSkeleton;
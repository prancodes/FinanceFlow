import React from 'react';

export const ListSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-100 lg:p-6">
      <div className="max-w-4xl mx-auto bg-white lg:p-8 p-6 rounded-lg shadow-lg">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-48 mb-3 md:mb-0"></div>
          <div className="h-10 bg-gray-200 rounded w-40"></div>
        </div>

        {/* Description Skeleton */}
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-8"></div>

        {/* Accounts List Skeleton */}
        <div className="mt-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
          <ul className="space-y-4">
            {[1, 2].map((i) => (
              <li key={i} className="relative bg-gray-50 p-4 rounded-lg shadow-md">
                <div className="animate-pulse space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="absolute right-4 bottom-4 h-5 w-5 bg-gray-200 rounded-full"></div>
                  <div className="absolute top-4 right-4 h-5 w-5 bg-gray-200 rounded-full"></div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ListSkeleton;
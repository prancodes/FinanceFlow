import React from 'react';

const FormSkeleton = () => {
  return (
    <div className="max-w-2xl mx-auto lg:mt-8 mt-3 p-6 bg-white rounded-xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
      
      <div className="space-y-6">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>

        <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
        <div className="h-10 bg-gray-200 rounded"></div>

        <div className="flex justify-between p-4 bg-gray-100 rounded-lg">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="h-6 w-12 bg-gray-200 rounded-full"></div>
        </div>

        <div className="flex gap-4 mt-8">
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    </div>
  );
};

export default FormSkeleton;
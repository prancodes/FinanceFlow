import React from 'react';

const ErrorMessage = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="relative bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <span className="block sm:inline">{message}</span>
      <button
        type="button"
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
        onClick={onClose}
      >
        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <title>Close</title>
          <path d="M14.348 5.652a1 1 0 10-1.414-1.414L10 7.172 7.066 4.238a1 1 0 00-1.414 1.414L8.586 10l-2.934 2.934a1 1 0 101.414 1.414L10 12.828l2.934 2.934a1 1 0 001.414-1.414L11.414 10l2.934-2.934z"/>
        </svg>
      </button>
    </div>
  );
};

export default ErrorMessage;
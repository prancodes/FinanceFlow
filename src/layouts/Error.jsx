import React from 'react';

const Error = ({ message, statusCode = 500 }) => {
  return (
    <html>
      <head>
        <title>{`Error ${statusCode}`}</title>
   
      </head>
      <body className="bg-gray-100 flex items-center justify-center h-screen">
        <div className="bg-white p-8 rounded shadow-lg max-w-md text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">{`Error ${statusCode}`}</h1>
          <p className="text-lg text-gray-700 mb-6">{message}</p>
          <a 
            href="/" 
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </body>
    </html>
  );
};

export default Error;

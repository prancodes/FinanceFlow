import React from "react";

const Signup = () => {
  return (
    <>
    <link rel="stylesheet" href="../styles/tailwind.css" />
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-center text-xl sm:text-2xl font-semibold text-gray-700 mb-6">
          FinanceFlow
        </h2>
        <h3 className="text-center text-lg sm:text-xl font-medium text-gray-600 mb-4">
          Create New Account
        </h3>

        <form action="/signup" method="POST">
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="user[name]"
              placeholder="John Doe"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              name="user[email]"
              placeholder="abc@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              name="user[password]"
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-500">Login</a>
        </p>
      </div>
    </div>
    </>
  );
};

export default Signup;

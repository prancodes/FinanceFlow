import React from "react";

const Login = () => {
  return (
    <>
      <link rel="stylesheet" href="../styles/tailwind.css" />
      <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6">
        <div className="w-full max-w-sm sm:max-w-md bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-center text-xl sm:text-2xl font-semibold text-gray-700 mb-6">
            FinanceFlow
          </h2>
          <h3 className="text-center text-lg sm:text-xl font-medium text-gray-600 mb-4">
            Login
          </h3>
          <form method="POST" action="/login">
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                name="login[email]"
                placeholder="abc@example.com"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                name="login[password]"
                placeholder="Enter your password"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
            >
              Login
            </button>
          </form>
          <p className="text-center text-sm text-gray-600 mt-4">
            Don't have an account?{" "}
            <a href="/signup" className="text-blue-500">Sign Up</a>
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;

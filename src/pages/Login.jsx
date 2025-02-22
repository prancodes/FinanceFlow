import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: { email, password },
        }),
        credentials: 'include', // include cookies if needed
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        const data = await response.json();
        setError(data.error || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="max-w-sm mx-auto mt-10 p-6">
        <h2 className="text-center text-xl sm:text-2xl font-semibold text-gray-700 mb-6">
          FinanceFlow
        </h2>
        <h3 className="text-center text-lg sm:text-xl font-medium text-gray-600 mb-4">
          Login
        </h3>
        <ErrorMessage message={error} onClose={() => setError('')} />
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="login[email]"
            placeholder="abc@example.com"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="login[password]"
            placeholder="Enter your password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          Login
        </button>
        <p className="text-center text-sm text-gray-600 mt-4">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-500">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  );
};

export default Login;

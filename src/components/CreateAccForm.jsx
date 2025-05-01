import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';
import FormSkeleton from '../skeletons/FormSkeleton';
import { Helmet } from "react-helmet";

const CreateAccForm = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [balance, setBalance] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/checkAuth');
        if (response.status === 200) {
          setIsAuthenticated(true);
        } else {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      } finally {
        setIsInitializing(false);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/dashboard/addAccount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: { name, type, balance },
        }),
      });

      if (response.ok) {
        navigate('/dashboard');
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create account");
      }
    } catch (error) {
      setError("An error occurred while creating the account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isInitializing) {
    return <FormSkeleton />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex items-center justify-center lg:mt-8 bg-gray-100 lg:px-4">
      <Helmet>
        <title>MyExpense - Create Your Account</title>
      </Helmet>
      <div className="w-full max-w-sm sm:max-w-md bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit}>
          <ErrorMessage message={error} onClose={() => setError('')} />
          <label className="mb-5 block text-2xl font-bold text-gray-900">Create New Account</label>

          <div className="mb-5">
            <label htmlFor="accName" className="block mb-2 text-sm font-medium text-gray-900">Account Name</label>
            <input
              type="text"
              id="accName"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="Eg: College Expenses"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="mb-5">
            <label htmlFor="accType" className="block mb-2 text-sm font-medium text-gray-900">Account Type</label>
            <select
              id="accType"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
              disabled={isSubmitting}
            >
              <option>Select Account Type</option>
              <option value="Current">Current</option>
              <option value="Savings">Savings</option>
            </select>
          </div>

          <div className="mb-5">
            <label htmlFor="initBalance" className="block mb-2 text-sm font-medium text-gray-900">Initial Balance</label>
            <input
              type="number"
              id="initBalance"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="0.00"
              min={1}
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="flex justify-center mb-5">
            <div className="flex items-center h-5">
              <input
                id="terms"
                type="checkbox"
                className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300"
                required
                disabled={isSubmitting}
              />
            </div>
            <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-900">
              I'm ready to manage my <span className="text-blue-600 font-semibold">Finances.</span>
            </label>
          </div>

          <div className="flex justify-center">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:bg-blue-300 relative"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="invisible">Add Account</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                </>
              ) : (
                "Add Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAccForm;

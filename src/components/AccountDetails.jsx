// src/components/AccountDetails.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';

const AccountDetail = () => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [account, setAccount] = useState({ name: '', type: '', balance: 0, transactions: [] });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const handleViewAnalytics = () => {
    navigate(`/dashboard/${accountId}/analytics`); // Navigate to the analytics page
  };

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
        setError("Error checking authentication.");
        navigate('/login');
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchAccountData = async () => {
      try {
        const response = await fetch(`/api/dashboard/${accountId}`);
        const data = await response.json();
        setAccount(data);
      } catch (error) {
        setError("Error fetching account data.");
      }
    };

    fetchAccountData();
  }, [accountId]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <ErrorMessage message={error} onClose={() => setError('')} />
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          {account.name} - Account Details
        </h1>
        <div className='flex items-center justify-center'>
          <button
            type="button"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-5 cursor-pointer"
            onClick={handleViewAnalytics}
          >
            View Analytics
          </button>
        </div>
        <p className="text-lg text-gray-700 mb-4">
          <strong>Type:</strong> {account.type}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <strong>Initial Balance:</strong> ₹{Number(account.initialBalance).toFixed(2)}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <strong>Balance:</strong> ₹{Number(account.balance).toFixed(2)}
        </p>
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transactions</h2>
          <ul className="space-y-4">
            {account.transactions && account.transactions.length > 0 ? (
              account.transactions.map((txn) => {
                const transactionDate = new Date(txn.date);
                return (
                  <li key={txn._id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                    <p className="text-gray-600 mb-1">
                      <strong>Amount:</strong> ₹{Number(txn.amount).toFixed(2)}
                    </p>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-gray-600">
                        <strong>Type:</strong> {txn.type}
                      </span>
                      <Link to={`/dashboard/${account._id}/transaction/${txn._id}/edit`} className="cursor-pointer">
                        Edit
                      </Link>
                    </div>
                    <p className="text-gray-600">
                      <strong>Date:</strong>
                    {`
                      ${String(transactionDate.getDate()).padStart(2, '0')}/${String(transactionDate.getMonth() + 1).padStart(2, '0')}/${transactionDate.getFullYear()}
                      ${transactionDate.toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: true
                      })}
                    `}
                    </p>
                  </li>
                );
              })
            ) : (
              <li className="bg-gray-50 p-4 rounded-lg shadow-md">
                <p className="text-gray-600">No transactions found.</p>
              </li>
            )}
          </ul>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <Link to="/dashboard" className="text-blue-500 hover:underline cursor-pointer">
            Back to Dashboard
          </Link>
          <Link
            to={`/dashboard/${account._id}/createTransaction`}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Create Transaction
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
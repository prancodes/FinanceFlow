// src/components/AccountDetails.jsx
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';

const AccountDetail = () => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [account, setAccount] = useState({ name: '', type: '', balance: 0, transactions: [] });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        console.error('Error fetching account data:', error);
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
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          {account.name} Account Details
        </h1>
        <div className='flex items-center justify-center'>
          <button 
            type="button" 
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-5"
            onClick={handleViewAnalytics}
          >
            View Analytics
          </button>
        </div>
        <p className="text-lg text-gray-700 mb-4">
          <strong>Type:</strong> {account.type}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <strong>Initial Balance:</strong> ${Number(account.initialBalance).toFixed(2)}
        </p>
        <p className="text-lg text-gray-700 mb-4">
          <strong>Balance:</strong> ${Number(account.balance).toFixed(2)}
        </p>
        <div className="mt-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Transactions</h2>
          <ul className="space-y-4">
            {account.transactions && account.transactions.length > 0 ? (
              account.transactions.map((txn) => (
                <li key={txn._id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <p className="text-gray-600 mb-1">
                    <strong>Amount:</strong> ${Number(txn.amount).toFixed(2)}
                  </p>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600">
                      <strong>Type:</strong> {txn.type}
                    </span>
                    <Link to={`/dashboard/${account._id}/transaction/${txn._id}/edit`}>
                      Edit
                    </Link>
                  </div>
                  <p className="text-gray-600">
                    <strong>Date:</strong> {new Date(txn.date).toLocaleString()}
                  </p>
                </li>
              ))
            ) : (
              <li className="bg-gray-50 p-4 rounded-lg shadow-md">
                <p className="text-gray-600">No transactions found.</p>
              </li>
            )}
          </ul>
        </div>
        <div className="mt-6 flex justify-between items-center">
          <Link to="/dashboard" className="text-blue-500 hover:underline">
            Back to Dashboard
          </Link>
          <Link 
            to={`/dashboard/${account._id}/createTransaction`} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Create Transaction
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
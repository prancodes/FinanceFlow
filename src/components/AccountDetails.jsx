import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ErrorMessage from '../components/ErrorMessage';
import ListSkeleton from '../skeletons/ListSkeleton';
import { Helmet } from "react-helmet";


// Cache outside component
let dataPromise = null;

const AccountDetail = () => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [allCategories, setAllCategories] = useState(["All"]);

  useEffect(() => {
    let isMounted = true; // Flag to track component mount status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/checkAuth');
        if (response.status === 200) return true;
        navigate('/login');
        return false;
      } catch (error) {
        navigate('/login');
        return false;
      }
    };

    const fetchAccountData = async () => {
      try {
        const response = await fetch(`/api/dashboard/${accountId}`);
        if (!response.ok) throw new Error('Failed to fetch account');
        return response.json();
      } catch (error) {
        throw error;
      }
    };

    const initializeData = async () => {
      const isAuth = await checkAuth();
      if (!isAuth || !isMounted) return;
      if (!isAuth) return;

      try {
        if (!dataPromise) {
          dataPromise = fetchAccountData();
        }

        const data = await dataPromise;
        if (!isMounted) return;
        setAccount(data);
        setIsAuthenticated(true);

         // Update categories after account data is loaded
        if (data.transactions) {
          const categories = ["All", ...new Set(data.transactions.map((txn) => txn.category))];
          setAllCategories(categories);
        }
      } catch (error) {
         if (isMounted) {
          setError(error.message || 'Error fetching account data');
        }
        setError(error.message || 'Error fetching account data');
      }
    };

    initializeData();

    return () => {
       isMounted = false; // Cleanup when component unmounts
      if (!account) dataPromise = null;
    };
  }, [accountId, navigate]);

  const handleViewAnalytics = () => {
    navigate(`/dashboard/${accountId}/analytics`);
  };

  const handleDeleteTransaction = async (transactionId, transactionType, transactionAmount) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this transaction?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`/api/dashboard/${accountId}/transaction/${transactionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setAccount(prev => {
          const updatedTransactions = prev.transactions.filter(txn => txn._id !== transactionId);
          let updatedBalance = prev.balance;
          let updatedInitialBalance = prev.initialBalance;

          if (transactionType === "Expense") {
            updatedBalance += transactionAmount;
          } else if (transactionType === "Income") {
            updatedInitialBalance -= transactionAmount;
            updatedBalance -= transactionAmount;
          }

          return {
            ...prev,
            transactions: updatedTransactions,
            balance: updatedBalance,
            initialBalance: updatedInitialBalance
          };
        });
        alert("Transaction deleted successfully");
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete transaction");
      }
    } catch (error) {
      setError("An error occurred while deleting the transaction");
    }
  };

  if (!isAuthenticated || !account) {
    return <ListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100 lg:p-6">
      <Helmet>
        <title>FinanceFlow - Account Details</title>
      </Helmet>
      <div className="max-w-4xl mx-auto bg-white lg:p-8 p-6 rounded-lg shadow-lg">
        <ErrorMessage message={error} onClose={() => setError('')} />
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6 sm:block flex flex-col">
          '{account.name}' <span>Account Details</span>
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
        {Number(account.balance).toFixed(2) < 0 ? (
          <p className="text-lg text-red-700 mb-4">
            <strong>Balance:</strong> ₹{Number(account.balance).toFixed(2)}
          </p>
        ) : (
          <p className="text-lg text-green-700 mb-4">
            <strong>Balance:</strong> ₹{Number(account.balance).toFixed(2)}
          </p>
        )}

        <div className="mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Transactions</h2>
             <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-2 sm:mt-0 sm:ml-4 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allCategories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div className="mt-6 mb-6 flex justify-between items-center">
            <Link to="/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer">
              Back to Dashboard
            </Link>
            <Link
              to={`/dashboard/${account._id}/createTransaction`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Create Transaction
            </Link>
          </div>

          {account.transactions && account.transactions.length > 0 ? (
            Object.entries(
              account.transactions.reduce((acc, txn) => {
                acc[txn.category] = acc[txn.category] || [];
                acc[txn.category].push(txn);
                return acc;
              }, {})
            )
              .filter(([category]) => selectedCategory === "All" || selectedCategory === category)
              .map(([category, transactions]) => (
                <div key={category} className="mb-6">
                  <ul className="space-y-4">
                    {transactions.map((txn) => {
                      const transactionDate = new Date(txn.date);
                      const amount = txn.type === 'Expense' ? -Math.abs(txn.amount) : Math.abs(txn.amount);

                      return (
                        <li key={txn._id} className="bg-gray-50 p-4 rounded-lg shadow-md">
                          <p className={`${txn.type === 'Expense' ? 'text-red-600' : 'text-green-800'} mb-1`}>
                            <strong>Amount:</strong> ₹{amount.toFixed(2)}
                          </p>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">
                              <strong>Category:</strong> {txn.category}
                            </span>
                            <div className='flex gap-2'>
                              <Link to={`/dashboard/${account._id}/transaction/${txn._id}/edit`} className="cursor-pointer">
                                <FaEdit size={18} />
                              </Link>
                              <button onClick={() => handleDeleteTransaction(txn._id, txn.type, parseFloat(txn.amount.toString()))}
                                className='hover:cursor-pointer'>
                                <FaTrash size={18} />
                              </button>
                            </div>
                          </div>
                          <p className="text-gray-600">
                            <strong>Date: </strong> {`
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
                    })}
                  </ul>
                </div>
              ))
          ) : (
            <li className="list-none bg-gray-50 p-4 rounded-lg shadow-md">
              <p className="text-gray-600">No transactions found.</p>
            </li>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountDetail;
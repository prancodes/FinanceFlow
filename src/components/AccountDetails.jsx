import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaTrash } from 'react-icons/fa';
import ErrorMessage from '../components/ErrorMessage';
import ListSkeleton from '../skeletons/ListSkeleton';

// Cache outside component
let dataPromise = null;

const AccountDetail = () => {
  const navigate = useNavigate();
  const { accountId } = useParams();
  const [account, setAccount] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
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
      if (!isAuth) return;

      try {
        if (!dataPromise) {
          dataPromise = fetchAccountData();
        }
        
        const data = await dataPromise;
        setAccount(data);
        setIsAuthenticated(true);
      } catch (error) {
        setError(error.message || 'Error fetching account data');
      }
    };

    initializeData();

    return () => {
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
      // console.error("Error deleting transaction:", error);
      setError("An error occurred while deleting the transaction");
    }
  };

  if (!isAuthenticated || !account) {
    return <ListSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-100 lg:p-6">
      <div className="max-w-4xl mx-auto bg-white lg:p-8 p-6 rounded-lg shadow-lg">
        <ErrorMessage message={error} onClose={() => setError('')} />
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          '{account.name}' Account Details
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
        {Number(account.balance).toFixed(2) < 0 ?(
          <p className="text-lg text-red-700 mb-4">
          <strong>Balance:</strong> ₹{Number(account.balance).toFixed(2)}
        </p>):(
          <p className="text-lg text-gray-700 mb-4">
          <strong>Balance:</strong> ₹{Number(account.balance).toFixed(2)}
        </p>
        ) }
        
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
                    <div className='flex gap-2'>
                      <Link to={`/dashboard/${account._id}/transaction/${txn._id}/edit`} className="cursor-pointer">
                      <FaEdit size={18} />
                      </Link>
                    <button    onClick={() => handleDeleteTransaction(txn._id, txn.type, parseFloat(txn.amount.toString()))} className='hover:cursor-pointer'>
                      <FaTrash size={18} />
                    </button>
                    </div>
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
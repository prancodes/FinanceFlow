import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ErrorMessage from '../components/ErrorMessage';

const EditTransaction = () => {
  const { accountId, transactionId } = useParams();
  const [transaction, setTransaction] = useState({
    type: "",
    amount: "",
    category: "",
    date: "",
    description: "",
    isRecurring: false,
    recurringInterval: "",
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
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
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        const response = await fetch(`/api/dashboard/${accountId}/transaction/${transactionId}/edit`);
        if (!response.ok) {
          throw new Error('Failed to fetch transaction data');
        }
        const data = await response.json();
        setTransaction({
          type: data.type || "",
          amount: data.amount ? data.amount.toString() : "",
          category: data.category || "",
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : "",
          description: data.description || "",
          isRecurring: data.isRecurring || false,
          recurringInterval: data.recurringInterval || "",
        });
      } catch (error) {
        setError(error.message || 'An error occurred while loading the transaction.');
      }
    };

    fetchTransactionData();
  }, [accountId, transactionId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedTransaction = {
        ...transaction,
        amount: parseFloat(transaction.amount),
      };

      const response = await fetch(`/api/dashboard/${accountId}/transaction/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction: updatedTransaction }),
      });

      if (response.ok) {
        navigate(`/dashboard/${accountId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update transaction");
      }
    } catch (error) {
      setError("An error occurred while updating the transaction.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto mt-3 p-6 bg-white rounded-xl"
      >
        <h2 className="text-4xl font-bold text-blue-600 mb-4">Edit Transaction</h2>
        <ErrorMessage message={error} onClose={() => setError('')} />

        <div className="mb-4">
          <label className="block text-black mb-3">Type</label>
          <select
            name="transaction[type]"
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200 cursor-pointer"
            value={transaction.type}
            onChange={(e) => setTransaction({ ...transaction, type: e.target.value })}
          >
            <option>Expense</option>
            <option>Income</option>
          </select>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-black mb-3">Amount</label>
            <input
              type="number"
              name="transaction[amount]"
              className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200 cursor-pointer"
              placeholder="0.00"
              value={transaction.amount}
              onChange={(e) => setTransaction({ ...transaction, amount: e.target.value })}
            />
          </div>
          <input type="hidden" name="transaction[account]" value={accountId} />
        </div>

        <div className="mb-4">
          <label className="block text-black mb-3">Category</label>
          <select
            name="transaction[category]"
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200 cursor-pointer"
            value={transaction.category}
            onChange={(e) => setTransaction({ ...transaction, category: e.target.value })}
          >
            <option>Select category</option>
            <option>Food</option>
            <option>Transport</option>
            <option>Entertainment</option>
            <option>Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-black mb-3">Date</label>
          <input
            type="date"
            name="transaction[date]"
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200 cursor-pointer"
            value={transaction.date}
            onChange={(e) => setTransaction({ ...transaction, date: e.target.value })}
          />
        </div>

        <div className="mb-4">
          <label className="block text-black mb-3">Description</label>
          <input
            type="text"
            name="transaction[description]"
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200 cursor-pointer"
            placeholder="Enter description"
            value={transaction.description}
            onChange={(e) => setTransaction({ ...transaction, description: e.target.value })}
          />
        </div>

        <div className="mb-6 flex items-center justify-between border border-gray-300 rounded-lg bg-gray-100 p-4">
          <div>
            <label className="text-black">Recurring Transaction</label>
            <p className="text-gray-400 text-sm">Setup a recurring schedule for this transaction</p>
          </div>
          <button
            type="button"
            className={`relative inline-flex items-center cursor-pointer w-10 h-6 rounded-full transition-colors focus:outline-none ${transaction.isRecurring ? 'bg-blue-500' : 'bg-gray-300'} cursor-pointer`}
            onClick={() => setTransaction({ ...transaction, isRecurring: !transaction.isRecurring })}
          >
            <span
              className={`inline-block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${transaction.isRecurring ? 'translate-x-5' : 'translate-x-1'}`}
            ></span>
          </button>
        </div>

        {transaction.isRecurring && (
          <div className="mb-4">
            <label className="block text-black mb-3">Recurring Interval</label>
            <select
              name="transaction[recurringInterval]"
              className="w-full p-2 h-10 border border-gray-300 rounded-lg bg-gray-100 focus:ring-gray-200 cursor-pointer"
              value={transaction.recurringInterval}
              onChange={(e) => setTransaction({ ...transaction, recurringInterval: e.target.value })}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
        )}

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={() => navigate(`/dashboard/${accountId}`)}
            className="w-1/2 px-4 py-2 hover:bg-gray-300 rounded-lg bg-gray-200 cursor-pointer"
          >
            Cancel
          </button>
          <button type="submit" className="w-1/2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-black text-white cursor-pointer">
            Update Transaction
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTransaction;


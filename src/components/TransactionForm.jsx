import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUpload } from 'react-icons/fa';
import ErrorMessage from '../components/ErrorMessage';

const TransactionForm = () => {
  const { accountId } = useParams();
  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState("Daily");
  const [receiptFile, setReceiptFile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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

  const handleScanWithAI = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith('image/')) {
          setError("Only image files are allowed");
          return;
        }
        // Note: Ensure the file size is within the limit (e.g., 5MB)
        if (file.size > 5 * 1024 * 1024) {
          setError("File size exceeds the 5MB limit");
          return;
        }
        setReceiptFile(file);
        setIsLoading(true);
        try {
          const fileData = await readFileAsDataURL(file);
          const response = await fetch(`/api/dashboard/${accountId}/transaction/scan-receipt`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fileData, fileType: file.type }),
          });

          if (response.ok) {
            const result = await response.json();
            const parsedData = result.data;

            const extractedAmount = parsedData.amount || "";
            const extractedDate = parsedData.date ? new Date(parsedData.date).toISOString().split('T')[0] : "";
            let extractedDescription = parsedData.description || "Scanned from receipt";
            const extractedCategory = parsedData.category || "";
            const extractedType = parsedData.type || "Expense";
            const extractedIsRecurring = parsedData.isRecurring || "no";
            const extractedRecurringInterval = parsedData.recurringInterval || null;

            // Limit description to 10 words
            const descriptionWords = extractedDescription.split(" ");
            if (descriptionWords.length > 10) {
              extractedDescription = descriptionWords.slice(0, 10).join(" ") + "...";
            }

            setAmount(extractedAmount);
            setDate(extractedDate);
            setDescription(extractedDescription);
            setCategory(extractedCategory);
            setType(extractedType);
            setIsRecurring(extractedIsRecurring.toLowerCase() === "yes");
            setRecurringInterval(extractedRecurringInterval);
          } else {
            setError("Failed to scan receipt");
          }
        } catch (error) {
          setError("An error occurred while scanning the receipt.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setError("No file selected");
      }
    };
    fileInput.click();
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        resolve(event.target.result);
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/dashboard/${accountId}/transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transaction: { 
            type,
            amount,
            category, 
            date,
            description, 
            isRecurring,
            recurringInterval: isRecurring ? recurringInterval : null,
            account: accountId 
          },
        }),
      });

      if (response.ok) {
        navigate(`/dashboard/${accountId}`);
      } else {
        setError("Failed to create transaction");
      }
    } catch (error) {
      setError("An error occurred while creating the transaction.");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div>
      <form 
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-xl"
      >
        <h2 className="text-4xl font-bold text-blue-600 mb-4">Add Transaction</h2>
        <ErrorMessage message={error} onClose={() => setError('')} />
        <button 
          type="button"
          className="mb-2 w-full px-4 py-2 hover:cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors flex items-center justify-center"
          onClick={handleScanWithAI}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scan Receipt with AI
            </>
          ) : (
            <>
              <FaUpload className="mr-3" />
              Scan Receipt with AI
            </>
          )}
        </button>
        <p className="text-gray-600 text-sm mb-5">*Note: The file size should not exceed 5MB.</p>

        <div className="mb-4">
          <label htmlFor='type' className="block text-black mb-3">Type</label>
          <select
            id='type'
            name="transaction[type]"
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option>Expense</option>
            <option>Income</option>
          </select>
        </div>

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-black">Amount
              <input
                type="number"
                name="transaction[amount]"
                className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </label>
          </div>
          {/* Use hidden input to set the default account */}
          <input type="hidden" name="transaction[account]" value={accountId} />
        </div>

        <div className="mb-4">
          <label htmlFor="category" className="block text-black mb-3">Category</label>
          <select
            id="category"
            name="transaction[category]"
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option>Select category</option>
            <option>Food</option>
            <option>Transport</option>
            <option>Entertainment</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-black mb-3">Date
            <input
              type="date"
              name="transaction[date]"
              className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="mb-4">
          <label className="block text-black mb-3">Description
            <input
              type="text"
              name="transaction[description]"
              className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
              placeholder="Enter description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </label>
        </div>

        <div className="mb-6 flex items-center justify-between border border-gray-300 rounded-lg bg-gray-100 p-4">
          <div>
            <label className="text-black">Recurring Transaction</label>
            <p className="text-gray-400 text-sm">Setup a recurring schedule for this transaction</p>
          </div>
          <button
            type="button"
            className={`relative inline-flex items-center cursor-pointer w-10 h-6 rounded-full transition-colors focus:outline-none ${isRecurring ? 'bg-blue-500' : 'bg-gray-300'}`}
            onClick={() => setIsRecurring(!isRecurring)}
          >
            <span
              className={`inline-block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isRecurring ? 'translate-x-5' : 'translate-x-1'}`}
            ></span>
          </button>
        </div>

        {isRecurring && (
          <div className="mb-4">
            <label className="block text-black mb-3">Recurring Interval</label>
            <select
              name="transaction[recurringInterval]"
              className="w-full p-2 h-10 border border-gray-300 rounded-lg bg-gray-100 focus:ring-gray-200"
              value={recurringInterval}
              onChange={(e) => setRecurringInterval(e.target.value)}
            >
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
        )}

        <div className="flex space-x-4">
          <button type="button" className="w-1/2 px-4 py-2 hover:bg-gray-300 rounded-lg bg-gray-200">
            Cancel
          </button>
          <button type="submit" className="w-1/2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-black text-white">
            Create Transaction
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;
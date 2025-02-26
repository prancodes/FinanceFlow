import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUpload } from 'react-icons/fa';
import ErrorMessage from '../components/ErrorMessage';
import FormSkeleton from '../skeletons/FormSkeleton';

const TransactionForm = () => {
  const { accountId } = useParams();
  const [formData, setFormData] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthAndInitialize = async () => {
      try {
        const authResponse = await fetch('/api/checkAuth');
        if (authResponse.status !== 200) {
          navigate('/login');
          return;
        }

        setFormData({
          type: "Expense",
          amount: "",
          category: "",
          date: new Date().toISOString().split('T')[0],
          description: "",
          isRecurring: false,
          recurringInterval: "Daily",
          receiptFile: null
        });
        setIsAuthenticated(true);
      } catch (error) {
        navigate('/login');
      }
    };

    checkAuthAndInitialize();
  }, [navigate, accountId]);

  const handleScanWithAI = async () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) {
        setError("No file selected");
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("Only image files are allowed");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds the 5MB limit");
        return;
      }

      setIsLoading(true);
      try {
        const fileData = await readFileAsDataURL(file);
        const response = await fetch(`/api/dashboard/${accountId}/transaction/scan-receipt`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileData, fileType: file.type }),
        });

        if (!response.ok) throw new Error("Failed to scan receipt");
        
        const result = await response.json();
        const parsedData = result.data;

        setFormData(prev => ({
          ...prev,
          amount: parsedData.amount || "",
          date: parsedData.date ? new Date(parsedData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          description: parsedData.description ? parsedData.description.split(" ").slice(0, 10).join(" ") + "..." : "Scanned from receipt",
          category: parsedData.category || "Other",
          type: parsedData.type || "Expense",
          isRecurring: (parsedData.isRecurring || "no").toLowerCase() === "yes",
          recurringInterval: parsedData.recurringInterval || "Daily"
        }));
      } catch (error) {
        setError(error.message || "An error occurred while scanning the receipt.");
      } finally {
        setIsLoading(false);
      }
    };
    fileInput.click();
  };

  const readFileAsDataURL = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/dashboard/${accountId}/transaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: {
            ...formData,
            amount: parseFloat(formData.amount),
            recurringInterval: formData.isRecurring ? formData.recurringInterval : null,
            account: accountId
          }
        }),
      });

      if (!response.ok) throw new Error("Failed to create transaction");
      navigate(`/dashboard/${accountId}`);
    } catch (error) {
      setError(error.message || "An error occurred while creating the transaction.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !formData) {
    return <FormSkeleton />;
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto lg:mt-8 mt-3 p-6 bg-white rounded-xl">
        <h2 className="text-4xl font-bold text-blue-600 mb-4">Add Transaction</h2>
        <ErrorMessage message={error} onClose={() => setError('')} />

        <button 
          type="button"
          className="mb-2 w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors flex items-center justify-center"
          onClick={handleScanWithAI}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Scanning...
            </>
          ) : (
            <>
              <FaUpload className="mr-3" />
              Scan Receipt with AI
            </>
          )}
        </button>
        <p className="text-gray-600 text-sm mb-5">*Note: Maximum file size 5MB</p>

        <div className="mb-4">
          <label className="block text-black mb-3">Type</label>
          <select
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            disabled={isLoading}
          >
            <option>Expense</option>
            <option>Income</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-black mb-3">Amount</label>
          <input
            type="number"
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
            placeholder="0.00"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-black mb-3">Category</label>
          <select
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            disabled={isLoading}
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
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="mb-4">
          <label className="block text-black mb-3">Description</label>
          <input
            type="text"
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
            placeholder="Enter description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="mb-6 flex items-center justify-between border border-gray-300 rounded-lg bg-gray-100 p-4">
          <div>
            <label className="text-black">Recurring Transaction</label>
            <p className="text-gray-400 text-sm">Setup recurring schedule</p>
          </div>
          <button
            type="button"
            className={`relative inline-flex items-center w-10 h-6 rounded-full transition-colors ${
              formData.isRecurring ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onClick={() => setFormData({ ...formData, isRecurring: !formData.isRecurring })}
            disabled={isLoading}
          >
            <span
              className={`inline-block w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                formData.isRecurring ? 'translate-x-5' : 'translate-x-1'
              }`}
            ></span>
          </button>
        </div>

        {formData.isRecurring && (
          <div className="mb-4">
            <label className="block text-black mb-3">Recurring Interval</label>
            <select
              className="w-full p-2 h-10 border border-gray-300 rounded-lg bg-gray-100 focus:ring-gray-200"
              value={formData.recurringInterval}
              onChange={(e) => setFormData({ ...formData, recurringInterval: e.target.value })}
              disabled={isLoading}
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
            className="w-1/2 px-4 py-2 hover:bg-gray-300 rounded-lg bg-gray-200"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="w-1/2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-black text-white disabled:bg-gray-600 relative"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="invisible">Create Transaction</span>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                </div>
              </>
            ) : (
              "Create Transaction"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;

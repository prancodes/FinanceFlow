import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Tesseract from 'tesseract.js';

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
  const navigate = useNavigate();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceiptFile(file);
    } else {
      console.error("No file selected");
    }
  };

  const handleScanWithAI = () => {
    if (!receiptFile) {
      console.log('Please select a receipt file');
      return;
    }
    const fileUrl = URL.createObjectURL(receiptFile);
    Tesseract.recognize(fileUrl, 'eng', {
      logger: (info) => console.log(info),
    })
    .then(({ data: { text } }) => {
      console.log("Extracted Text:", text);
      const totalMatch = text.match(/Total\s*[:£]?\s*(\d+(\.\d{2})?)/i) || 
                         text.match(/Sub-Total\s*[:£]?\s*(\d+(\.\d{2})?)/i);
      const extractedAmount = totalMatch ? totalMatch[1] : "";
      const extractedDate = text.match(/\d{2}\/\d{2}\/\d{4}/);
      setAmount(extractedAmount ? extractedAmount : "");
      setDate(extractedDate ? extractedDate[0] : "");
      setDescription("Scanned from receipt");
    })
    .catch((error) => {
      console.error("Error scanning receipt:", error);
      alert("An error occurred while scanning the receipt.");
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
          transaction: { type, amount, category, date, description, isRecurring, recurringInterval, account: accountId },
        }),
      });

      if (response.ok) {
        navigate(`/dashboard/${accountId}`);
      } else {
        console.error('Failed to create transaction');
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    }
  };

  return (
    <div>
      <form 
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto mt-3 p-6 bg-white rounded-xl"
      >
        <h2 className="text-4xl font-bold text-blue-600 mb-4">Add Transaction</h2>
        <div className="mb-4">
          <label className="block text-black mb-2">Upload Receipt
            <input 
              type="file" 
              onChange={handleFileUpload} 
              className="w-full p-2 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
            />
          </label>
        </div>
        <button 
          type="button"
          className="mb-4 w-full px-4 py-2 hover:cursor-pointer bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors"
          onClick={handleScanWithAI}
        >
          Scan Receipt with AI
        </button>

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
            <label className="block text-black mb-3">Amount
              <input
                type="number"
                name="transaction[amount]"
                className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
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
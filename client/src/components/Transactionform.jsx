import { useState } from "react";

const Transactionform = () => {
  const [type, setType] = useState("Expense");
  const [amount, setAmount] = useState("");
  const [account, setAccount] = useState("Personal ($99148.56)");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("2024-12-14");
  const [description, setDescription] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState("Daily");

  return (
    <div className="max-w-2xl mx-auto mt-3 p-6 bg-white rounded-xl">
        <h2 className="text-4xl font-bold text-blue-600 mb-4">Add Transaction</h2>

        <button className="mb-4 w-full px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-colors">
            Scan Receipt with AI
        </button>



        <div className="mb-4">
            <label className="block text-black mb-3">Type</label>
                <select
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
            <label className="block text-black mb-3">Amount</label>
            <input
                type="number"
                className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />
        </div>
        <div className="flex-1">
          <label className="block text-black mb-3">Account</label>
          <select
            className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
            value={account}
            onChange={(e) => setAccount(e.target.value)}

          >
            <option>Personal (₹9914.56)</option>
            <option>Business (₹5000.00)</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-black mb-3">Category</label>
        <select
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
        <label className="block text-black mb-3">Date</label>
        <input
          type="date"
          className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-black mb-3">Description</label>
        <input
          type="text"
          className="w-full p-2 h-10 border border-gray-400 rounded-lg bg-gray-100 focus:ring-gray-200"
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

    <div className="mb-6 flex items-center justify-between border border-gray-300 rounded-lg bg-gray-100 p-4">
      <div>
        <label className="text-black">Recurring Transaction</label>
        <p className="text-gray-400 text-sm">Setup a recurring schedule for this transaction</p>
      </div>
      <button
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
        <button className="w-1/2 px-4 py-2 hover:bg-gray-300 rounded-lg bg-gray-200">Cancel</button>
        <button className="w-1/2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-black text-white">
          Create Transaction
        </button>
      </div>
    </div>
  );
};

export default Transactionform;

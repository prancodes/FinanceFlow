import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateAccForm = () => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [balance, setBalance] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/dashboard/addAccount', {
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
        console.error('Failed to create account');
      }
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  return (
    <div>
      <link rel="stylesheet" href="/styles/tailwind.css" />
      <form className="max-w-2xl mx-auto mt-10 p-6" onSubmit={handleSubmit}>
        <label className="mb-5 block text-2xl font-bold text-gray-900">Create New Account</label>
        <div className="mb-5">
          <label htmlFor="accName" className="block mb-2 text-sm font-medium text-gray-900">Account Name</label>
          <input 
            type="text" 
            id="accName" 
            className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            placeholder="Eg: College Expenses" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required 
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
          >
            <option>Select Account Type</option>
            <option value={'Current'}>Current</option>
            <option value={'Savings'}>Savings</option>
          </select>
        </div>
        <div className="mb-5">
          <label htmlFor="initBalance" className="block mb-2 text-sm font-medium text-gray-900">Initial Balance</label>
          <input 
            type="number" 
            id="initBalance" 
            className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" 
            placeholder="0.00" 
            value={balance}
            onChange={(e) => setBalance(e.target.value)}
            required 
          />
        </div>
        <div className="flex justify-center mb-5">
          <div className="flex items-center h-5">
            <input 
              id="terms" 
              type="checkbox"
              className="w-4 h-4 border border-gray-300 rounded-sm bg-gray-50 focus:ring-3 focus:ring-blue-300" 
              required 
            />
          </div>
          <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-900">
            I agree with the <a href="#" className="text-blue-600 hover:underline">terms and conditions</a>
          </label>
        </div>
        <div className="flex justify-center">
          <button 
            type="submit" 
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
          >
            Add Account
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAccForm;

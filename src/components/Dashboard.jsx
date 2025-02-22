import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [userData, setUserData] = useState({ name: '', accounts: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <link rel="stylesheet" href="/styles/tailwind.css" />
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-blue-600">
              Welcome, {userData.name}!
            </h1>
            <Link 
              to="/dashboard/addAccount"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Create Account
            </Link>
          </div>
          <p className="text-lg text-gray-700 mb-4">
            This is your dashboard. Here you can manage your accounts and transactions.
          </p>
          
          {/* Display user accounts */}
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Accounts</h2>
            <ul className="space-y-4">
              {userData.accounts && userData.accounts.length > 0 ? (
                userData.accounts.map((account) => (
                  <Link key={account._id} to={`/dashboard/${account._id}`}>
                    <li className="bg-gray-50 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100">
                      <h3 className="text-xl font-medium">{account.name}</h3>
                      <p className="text-gray-600">Type: {account.type}</p>
                      <p className="text-gray-600">
                        Balance: ${parseFloat(account.balance.toString()).toFixed(2)}
                      </p>
                    </li>
                  </Link>
                ))
              ) : (
                <li className="bg-gray-50 p-4 rounded-lg shadow-md">
                  <p className="text-gray-600">No accounts found.</p>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;

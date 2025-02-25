import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight,FaTrash } from 'react-icons/fa';
const Dashboard = () => {
  const [userData, setUserData] = useState({ name: '', accounts: [] });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/checkAuth');
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        setIsAuthenticated(true);
      } catch (error) {
        navigate('/login');
      }
    };

    const fetchData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        const data = await response.json();
        setUserData(data);
        setIsAuthenticated(true);
      } catch (error) {
        navigate('/login');
      }
    };

    checkAuth();
    fetchData();
  }, [navigate]);
  const handleDeleteAccount = async (accountId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this account?");
    if (!isConfirmed) return;
  
    try {
      const response = await fetch(`/api/dashboard/${accountId}`, {
        method: 'DELETE',
      });
  
      if (response.ok) {
        // Remove the deleted account from the UI
        setUserData((prevData) => ({
          ...prevData,
          accounts: prevData.accounts.filter((account) => account._id !== accountId),
        }));
        alert("Account deleted successfully");
      } else {
        const errorData = await response.json();
        alert(errorData.message || "Failed to delete account");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      alert("An error occurred while deleting the account");
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
        <div className="flex flex-col  md:flex-row justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">
            Welcome, {userData.name}!
          </h1>
          <Link 
            to="/dashboard/addAccount"
            className="px-4 py-2 mt-3 md:mt-0 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
    <div key={account._id} className="relative">
      <div
        onClick={() => navigate(`/dashboard/${account._id}`)} // Handle redirection manually
        className="bg-gray-50 mt-2 p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-100"
      >
        <h3 className="text-xl font-medium">{account.name}</h3>
        <p className="text-gray-600">Type: {account.type}</p>
        <p className="text-gray-600">
          Balance: ₹{parseFloat(account.balance.toString()).toFixed(2)}
        </p>
        <FaArrowRight className="inline-block absolute right-4 bottom-4" size={18} />
      </div>
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation(); // Stop event propagation
          handleDeleteAccount(account._id);
        }}
        className="absolute top-4 right-4 text-red-500 hover:text-red-700"
      >
        <FaTrash size={18} />
      </button>
    </div>
  ))
): (
              <li className="bg-gray-50 p-4 rounded-lg shadow-md">
                <p className="text-gray-600">No accounts found.</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

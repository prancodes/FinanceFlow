// src/layouts/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // Import useLocation

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation(); // Get current location

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/checkAuth');
        if (response.status === 200) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location]); // Add location as a dependency

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    setIsLoggedIn(false);
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <nav className="bg-white text-black p-4 fixed top-0 left-0 w-full shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div>
          <img src="/FinanceFlow.png" alt="FinanceFlow" className="h-8 w-auto cursor-pointer" onClick={handleLogoClick} />
        </div>
        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6">
          <Link to="/dashboard" className="shadow-md px-3 py-2 rounded-md text-gray-500 cursor-pointer">Dashboard</Link>
          <Link to="/dashboard/addAccount" className="shadow-md px-3 py-2 rounded-md text-black cursor-pointer">Create Account</Link>
          {loading ? (
            <div className="shadow-md px-4 py-2 rounded-md text-gray-500 cursor-pointer">Loading...</div>
          ) : isLoggedIn ? (
            <button onClick={handleLogout} className="shadow-md bg-black text-white px-4 py-2 rounded-md cursor-pointer">Logout</button>
          ) : (
            <>
              <Link to="/login" className="shadow-md bg-black text-white px-4 py-2 rounded-md cursor-pointer">Login</Link>
              <Link to="/signup" className="shadow-md bg-black text-white px-4 py-2 rounded-md cursor-pointer">Signup</Link>
            </>
          )}
        </div>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMenu} className="cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu links */}
      {isOpen && (
        <div className="md:hidden bg-blue-500">
          <Link to="/" className="block p-2 cursor-pointer">Home</Link>
          <Link to="/dashboard" className="block p-2 cursor-pointer">Dashboard</Link>
          <Link to="/dashboard/addAccount" className="block p-2 cursor-pointer">Create Account</Link>
          {loading ? (
            <div className="block p-2 cursor-pointer">Loading...</div>
          ) : isLoggedIn ? (
            <button onClick={handleLogout} className="block p-2 cursor-pointer">Logout</button>
          ) : (
            <>
              <Link to="/login" className="block p-2 cursor-pointer">Login</Link>
              <Link to="/signup" className="block p-2 cursor-pointer">Signup</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
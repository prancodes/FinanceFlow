// src/layouts/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home" className="font-bold text-lg">
          FinanceFlow
        </Link>
        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6">
          <Link to="/home">Home</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/dashboard/addAccount">Create Account</Link>
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button onClick={toggleMenu}>
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
          <Link to="/" className="block p-2">Home</Link>
          <Link to="/dashboard" className="block p-2">Dashboard</Link>
          <Link to="/dashboard/addAccount" className="block p-2">Create Account</Link>
          <Link to="/login" className="block p-2">Login</Link>
          <Link to="/signup" className="block p-2">Signup</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
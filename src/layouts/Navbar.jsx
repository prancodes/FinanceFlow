// src/layouts/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <nav className="bg-white text-white p-4 fixed top-0 left-0 w-full shadow-md z-50">

      <div className="container mx-auto flex justify-between items-center">
        <div>
          <img src="./FinanceFlow.png" alt="" className="h-8 w-auto"/>
        </div>
        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6">
          <Link to="/dashboard" className="shadow-md px-3 py-2 rounded-md text-gray-500">Dashboard</Link>
          <Link to="/dashboard/addAccount" className="shadow-md px-3 py-2 rounded-md text-black">Create Account</Link>
          <Link to="/login" className="shadow-md bg-black text-white px-4 py-2 rounded-md">Login</Link>
          <Link to="/signup" className="shadow-md bg-black text-white px-4 py-2 rounded-md">Signup</Link>
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
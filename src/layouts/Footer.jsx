import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="text-center py-10 bg-gradient-to-r from-blue-700 to-indigo-600 text-white flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-2">Ready to Take Control of Your Finances?</h2>
      <p className="mb-6 text-lg opacity-90">
        Join thousands of users who are already managing their finances smarter with FinanceFlow
      </p>
      <Link 
        to="/login" 
        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-200 transition duration-300"
      >
        Start Free Trial
      </Link>
      <div className="flex gap-6 mt-8 text-sm opacity-80">
        <Link to="/privacy" className="hover:underline hover:opacity-100 transition duration-200">Privacy Policy</Link>
        <Link to="/terms" className="hover:underline hover:opacity-100 transition duration-200">Terms of Service</Link>
      </div>
      <p className="mt-4 text-xs opacity-60">© 2026 FinanceFlow. All rights reserved.</p>
    </footer>
  );
};

export default Footer;


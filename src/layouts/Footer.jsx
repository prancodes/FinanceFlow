// import React from 'react'
// import { Link  } from 'react-router-dom'    

// const Footer = () => {
//   return (
//     <footer className="text-center py-4 bg-blue-600 text-white">
//         <h2 className="text-2xl font-semibold mb-2">Ready to Take Control of Your Finances?</h2>
//         <p className="mb-4">Join thousands of users who are already managing their finances smarter with Welth</p>
//         <Link to="/signup" className="bg-white text-blue-600 px-6 py-3 rounded-md font-semibold">Start Free Trail</Link>
//         <p>&copy; 2025 FinanceFlow. All rights reserved.</p>
//     </footer>
//   )
// }

// export default Footer
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="text-center py-10 bg-gradient-to-r from-blue-700 to-indigo-600 text-white flex flex-col items-center">
      <h2 className="text-2xl font-semibold mb-2">Ready to Take Control of Your Finances?</h2>
      <p className="mb-6 text-lg opacity-90">
        Join thousands of users who are already managing their finances smarter with Welth
      </p>
      <Link 
        to="/signup" 
        className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold shadow-lg hover:bg-gray-200 transition duration-300"
      >
        Start Free Trial
      </Link>
      <p className="mt-8 text-sm opacity-80">© 2025 FinanceFlow. All rights reserved.</p>
    </footer>
  );
};

export default Footer;


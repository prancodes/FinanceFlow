// src/App.jsx
import React, { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CreateAccForm from './components/CreateAccForm';
import TransactionForm from './components/TransactionForm';
import EditTransaction from './components/EditTransaction';
import AccountDetail from './components/AccountDetails';
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';

const App = ({ location }) => {
  const [Router, setRouter] = useState(null);

  useEffect(() => {
    const loadRouter = async () => {
      if (location) {
        const { StaticRouter } = await import('react-router-dom/server');
        setRouter(() => StaticRouter);
      } else {
        const { BrowserRouter } = await import('react-router-dom');
        setRouter(() => BrowserRouter);
      }
    };
    loadRouter();
  }, [location]);

  if (!Router) return null;

  return (
    <Router location={location}>
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <main className="flex-grow p-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/addAccount" element={<CreateAccForm />} />
            <Route path="/dashboard/:accountId/createTransaction" element={<TransactionForm />} />
            <Route path="/dashboard/:accountId/transaction/:transactionId/edit" element={<EditTransaction />} />
            <Route path="/dashboard/:accountId" element={<AccountDetail />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<h1 className="text-red-500 text-center">404: Page Not Found</h1>} />
          </Routes>
        </main>
        <footer className="text-center py-4 bg-blue-600 text-white">
          <p>&copy; 2025 FinanceFlow. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  );
};

export default App;
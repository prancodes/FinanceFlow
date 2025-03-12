import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/checkAuth");
        setIsLoggedIn(response.status === 200);
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [location]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      setIsLoggedIn(false);
      navigate("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav className="bg-white text-black p-4 fixed top-0 left-0 w-full shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img
            src="/FinanceFlowLogo.webp"
            alt="FinanceFlow"
            className="h-8 w-auto"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex space-x-6">
          <Link
            to="/dashboard"
            className={`shadow-md px-3 py-2 rounded-md ${location.pathname === '/dashboard'
              ? 'bg-gray-100 text-black'
              : 'text-gray-700 hover:bg-gray-100'
              } active:bg-gray-200`}
          >
            Dashboard
          </Link>

          <Link
            to="/dashboard/addAccount"
            className={`shadow-md px-3 py-2 rounded-md ${location.pathname === '/dashboard/addAccount'
              ? 'bg-gray-100 text-black'
              : 'text-gray-700 hover:bg-gray-100'
              } active:bg-gray-200`}
          >
            Create Account
          </Link>

          {loading ? (
            <div className="shadow-md px-4 py-2 rounded-md text-gray-500">
              Loading...
            </div>
          ) : isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="shadow-md bg-black text-white px-4 py-2 rounded-md cursor-pointer disabled:opacity-75 relative"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="invisible">Logout</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                </>
              ) : (
                "Logout"
              )}
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="shadow-md bg-black text-white px-4 py-2 rounded-md"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="shadow-md bg-black text-white px-4 py-2 rounded-md"
              >
                Signup
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all duration-200"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Links */}
      <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} mt-2`}>
        <div className="px-2 pt-2 pb-3 space-y-2 bg-white rounded-lg shadow-lg mx-2 border border-gray-200">
          <Link
            to="/dashboard"
            className={`block px-3 py-2 mb-0 rounded-md ${location.pathname === '/dashboard'
                ? 'bg-gray-100 text-black'
                : 'text-gray-700 hover:bg-gray-100'
              } active:bg-gray-200 border-b border-gray-200 transition-all duration-300`}
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            to="/dashboard/addAccount"
            className={`block px-3 py-2 rounded-md ${location.pathname === '/dashboard/addAccount'
                ? 'bg-gray-100 text-black'
                : 'text-gray-700 hover:bg-gray-100'
              } active:bg-gray-200 border-b border-gray-200 transition-all duration-300`}
            onClick={() => setIsOpen(false)}
          >
            Create Account
          </Link>

          {loading ? (
            <div className="block px-3 py-2 rounded-md text-gray-500">
              Loading...
            </div>
          ) : isLoggedIn ? (
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="w-full px-3 py-2 rounded-md bg-black text-white 
                         hover:bg-gray-800 active:scale-95 transition-all cursor-pointer disabled:opacity-75 relative"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="invisible">Logout</span>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                </>
              ) : (
                "Logout"
              )}
            </button>
          ) : (
            <div className="flex flex-col xs:flex-row gap-2">
              <Link
                to="/login"
                className="flex-1 text-center px-3 py-2 rounded-md bg-black text-white 
                           hover:bg-gray-800 active:scale-95 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="flex-1 text-center px-3 py-2 rounded-md bg-black text-white 
                           hover:bg-gray-800 active:scale-95 transition-all"
                onClick={() => setIsOpen(false)}
              >
                Signup
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
import React from 'react'
import { Link } from "react-router-dom";
const Home = () => {
  return (
    <div className="m-3">
      <div className="mb-2">Welcome to FinanceFlow</div>
      <Link to="/createAccount"><button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border border-blue-700 rounded">
        Create Account
      </button></Link>
      <Link to="/login"><button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ml-2">
        Login
      </button></Link>
      <Link to="/transaction"><button class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded ml-2">
        Add Transaction
      </button></Link>
    </div>
  )
}

export default Home
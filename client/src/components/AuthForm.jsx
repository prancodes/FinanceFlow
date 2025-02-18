import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

const AuthForm = ({ type }) => {
  const [formData,setFormData]=useState({name:"",email:"",password:""});
  const [error,setError]=useState(null);
  const navigate=useNavigate();
  const handleChange=(e)=>{
    setFormData({...formData,[e.target.name]:e.target.value})
  }
  const handleSubmit= async(e)=>{
    e.preventDefault();
    setError(null);
    const url= type==="signup" ? "http://localhost:8080/signup" : "http://localhost:8080/login"
 try{
  const response = await fetch(url,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Ensures cookies are sent
        body: JSON.stringify(formData),
  });
  const data=response.json();
  if(!response.ok)
    {
      throw new Error(data.message || "Something went wrong")
    }
    navigate("/");
 }
 catch(err){
  setError(err.message)
 }

  }
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4 sm:px-6">
      <div className="w-full max-w-sm sm:max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-center text-xl sm:text-2xl font-semibold text-gray-700 mb-6">
          FinanceFlow
        </h2>
        <h3 className="text-center text-lg sm:text-xl font-medium text-gray-600 mb-4">
          {type === "signup" ? "Create New Account" : "Login"}
        </h3>
        <form onSubmit={handleSubmit}>
          {type === "signup" && (
            <div className="mb-4">
              <label className="block text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                placeholder="John Doe"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="abc@example.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
             type="password"
             name="password"
             value={formData.password}
             onChange={handleChange}
             placeholder="Enter your password"
             className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
            />
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
            {type === "signup" ? "Sign Up" : "Login"}
          </button>
        </form>
        <p className="text-center text-sm text-gray-600 mt-4">
          {type === "signup" ? (
            <>
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500">
                Login
              </Link>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <Link to="/signup" className="text-blue-500">
                Sign Up
              </Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthForm;

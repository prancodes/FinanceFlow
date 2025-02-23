import React from 'react'
import { Link } from 'react-router-dom'

const HeroSection = () => {
  return (
    <div>
      <header className="flex flex-col items-center text-center px-8 pb-12 lg:pb-24 lg:pt-15 max-w-6xl mx-auto">
        <div className="w-full max-w-3xl">
      <h1 className=" text-2xl md:text-6xl font-extrabold leading-tight text-center whitespace-nowrap overflow-visible w-full inline-block px-4">
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Manage Your Finances
        </span>
        <br />
        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          with Intelligence
        </span>
      </h1>
      
          <p className="text-lg text-gray-600 mt-4">
            An AI-powered financial management platform that helps you track, 
            analyze, and optimize your spending with real-time insights.
          </p>
      
          <div className="flex flex-col sm:flex-row sm:justify-center gap-4 mt-6">
            <Link to="/signup" className="bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition font-semibold">
              Get Started
            </Link>
          </div>
        </div>
      
        {/* Image Below the Text */}
        <div className="w-full flex justify-center mt-10">
          <img src="./banner.jpeg" alt="AI Finance Robot" className="w-full max-w-3xl object-cover" />
        </div>
      </header>
    </div>
  )
}

export default HeroSection

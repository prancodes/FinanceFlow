import React from 'react';
import HeroSection from '../layouts/HeroSection';
import { FeatureCard, ReviewCard, StatsCard } from '../layouts/card'; 
import { FaChartBar, FaChartPie, FaReceipt, FaClipboardList, FaMoneyBillWave, FaCheckCircle } from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
        {/* Hero Section */}
        <HeroSection/>

      {/* Stats Section */}
      <div className="p-6 bg-blue-50 text-center grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Active Users" value="20K+" />
        <StatsCard label="Transactions Tracked" value="₹2B+" />
        <StatsCard label="Uptime" value="99.9%" />
        <StatsCard label="User Rating" value="4.9/5" />
      </div>

      {/* Features Section */}
      <div className="p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Everything you need to manage your finances
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard icon={FaChartBar} title="Advanced Analytics" desc="Get detailed insights into your spending patterns with AI-powered analytics" />
          <FeatureCard icon={FaReceipt} title="Smart Receipt Scanner" desc="Extract data automatically from receipts using advanced AI technology" />
          <FeatureCard icon={FaChartPie} title="Budget Planning" desc="Create and manage budgets with intelligent recommendations" />
        </div>
      </div>

      {/* Working Section */}
      <div className="p-8 bg-gray-100">
        <h2 className="text-2xl font-semibold text-center mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard icon={FaClipboardList} title="Step 1: Add Transactions" desc="Log your expenses and incomes easily." />
          <FeatureCard icon={FaMoneyBillWave} title="Step 2: Get Insights" desc="AI-driven analytics to understand spending." />
          <FeatureCard icon={FaCheckCircle} title="Step 3: Optimize Finances" desc="Receive smart recommendations to save more." />
        </div>
      </div>

      {/* Reviews Section */}
      <div className="p-8 text-center">
        <h2 className="text-2xl font-semibold mb-6">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReviewCard name="Krishna Sharma" role="Small Business Owner" text="FinanceFlow has transformed how I manage my business finances. The AI insights have helped me identify cost-saving opportunities I never knew existed." />
          <ReviewCard name="Rivaan Reddy" role="Freelancer" text="The receipt scanning feature saves me hours each month. Now I can focus on my work instead of manual data entry and expense tracking." />
          <ReviewCard name="Karan Singh" role="Financial Advisor" text="I recommend FinanceFlow to all my clients. The multi-currency support and detailed analytics make it perfect for international investors." />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

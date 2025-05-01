import React from "react";
import HeroSection from "../layouts/HeroSection";
import { FeatureCard, ReviewCard, StatsCard } from "../layouts/card";
import {
  FaChartBar,
  FaChartPie,
  FaReceipt,
  FaClipboardList,
  FaMoneyBillWave,
  FaCheckCircle,
} from "react-icons/fa";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col md:mt-7">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <div className="py-3 md:p-6 bg-blue-50 text-center grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Active Users" value="100+" />
        <StatsCard
          icon={FaCheckCircle}
          label="Secure & Reliable"
          value="100%"
        />
        <StatsCard label="Uptime" value="99.9%" />
        <StatsCard label="User Rating" value="4.9/5" />
      </div>

      {/* Features Section */}
      <div className="px-4 py-8 md:p-8">
        <h2 className="text-2xl font-semibold text-center mb-6">
          Everything you need to manage your finances
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={FaChartBar}
            title="Advanced Analytics"
            desc="Gain detailed insights into your spending patterns with our AI-powered analytics. Understand where your money goes, identify trends, and make data-driven decisions."
          />
          <FeatureCard
            icon={FaReceipt}
            title="Smart Receipt Scanner"
            desc="Automatically extract data from your receipts using advanced AI technology. Save time by eliminating manual data entry and ensure your expense tracking is accurate."
          />
          <FeatureCard
            icon={FaChartPie}
            title="Budget Planning"
            desc="Create and manage budgets with intelligent recommendations. Set spending limits, monitor variances, and get personalized advice to help you save more."
          />
        </div>
      </div>

      {/* Working Section */}
      <div className="px-4 py-8 md:p-8 bg-gray-100">
        <h2 className="text-2xl font-semibold text-center mb-6">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon={FaClipboardList}
            title="Step 1: Add Transactions"
            desc="Easily log your expenses and incomes with our user-friendly, intuitive interface designed for efficiency."
          />
          <FeatureCard
            icon={FaMoneyBillWave}
            title="Step 2: Get Insights"
            desc="Our AI-driven analytics thoroughly process your data, providing actionable insights and comprehensive, detailed reports."
          />
          <FeatureCard
            icon={FaCheckCircle}
            title="Step 3: Optimize Finances"
            desc="Get smart recommendations from your spending data to optimize budgets and boost financial health."
          />
        </div>

      </div>

      {/* Reviews Section */}
      <div className="px-4 py-8 md:p-8 text-center">
        <h2 className="text-2xl font-semibold mb-6">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ReviewCard
            name="Krishna Sharma"
            role="Small Business Owner"
            text="FinanceFlow has transformed how I manage my business finances. The AI insights have helped me identify cost-saving opportunities I never knew existed."
          />
          <ReviewCard
            name="Rivaan Reddy"
            role="Freelancer"
            text="The receipt scanning feature saves me hours each month. Now I can focus on my work instead of manual data entry and expense tracking."
          />
          <ReviewCard
            name="Karan Singh"
            role="Financial Advisor"
            text="I recommend MyExpense to all my clients. The multi-currency support and detailed analytics make it perfect for international investors."
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

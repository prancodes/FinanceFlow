import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bar, Line, Pie } from "react-chartjs-2";
import axios from "axios";
import ErrorMessage from '../components/ErrorMessage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { accountId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState({
    initialBalance: 0,
    currentBalance: 0,
    expensesByCategory: {},
    monthlySpending: {},
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/checkAuth');
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          navigate('/login');
        }
      } catch (error) {
        setError("Error checking authentication.");
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAvailableYears();
      fetchAnalyticsData();
    }
  }, [accountId, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && selectedYear) {
      fetchAnalyticsData();
    }
  }, [selectedYear]);

  const fetchAvailableYears = async () => {
    try {
      const response = await axios.get(`/api/dashboard/${accountId}/available-years`);
      setAvailableYears(response.data.years);
      if (response.data.years.length > 0) {
        setSelectedYear(response.data.years[0]); // Set the latest year as default
      }
    } catch (error) {
      setError("Error fetching available years.");
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      const response = await axios.get(`/api/dashboard/${accountId}/analytics`, {
        params: { year: selectedYear },
      });
      setData(response.data);
    } catch (error) {
      setError("Error fetching analytics data.");
    }
  };

  const CHART_COLORS = ["#FF6384", "#36A2EB", "#FFCE56", "#9966FF"];

  // Bar Chart data configurations
  const barChartData = {
    labels: Object.keys(data.expensesByCategory),
    datasets: [{
      label: "Expenses by Category",
      data: Object.values(data.expensesByCategory),
      backgroundColor: CHART_COLORS,
    }]
  };

  const lineChartData = {
    labels: ["Initial Balance", "Current Balance"],
    datasets: [{
      label: "Balance",
      data: [data.initialBalance, data.currentBalance],
      borderColor: "#4BC0C0",
      fill: false,
    }]
  };

  // For pie chart
  const pieChartData = {
    labels: Object.keys(data.expensesByCategory),
    datasets: [{
      data: Object.values(data.expensesByCategory),
      backgroundColor: CHART_COLORS,
    }]
  };

  const monthlySpendingData = {
    labels: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    datasets: [{
      label: "Monthly Spending",
      data: Object.values(data.monthlySpending),
      borderColor: "#FF6384",
      fill: false,
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };

  if (!isAuthenticated) return null;

  return (
    <div className="p-6 bg-white rounded-lg shadow-md space-y-8">
      <ErrorMessage message={error} onClose={() => setError('')} />
      <h1 className="text-3xl font-bold text-gray-800">Financial Analytics</h1>

      {/* Year Selector */}
      <div className="mb-6 flex items-center gap-4">
        <label className="text-lg font-semibold">Select Year:</label>
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(parseInt(e.target.value))}
          className="p-2 border rounded"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      {/* Original Chart Structure */}
      <div className="flex flex-col md:flex-row md:gap-8">
        <div className="mb-8 md:flex-1">
          <h3 className="text-xl font-semibold mb-2">Expenses by Category</h3>
          <div className="w-full h-96">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        <div className="mb-8 md:flex-1">
          <h3 className="text-xl font-semibold mb-2">Balance Overview</h3>
          <div className="w-full h-96">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Expense Distribution</h3>
        <div className="w-full h-96">
          <Pie data={pieChartData} options={chartOptions} />
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-2">Monthly Spending Trend</h3>
        <div className="w-full h-96">
          <Line data={monthlySpendingData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
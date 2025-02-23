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

// Register Chart.js components
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

const Analytics = ({ userId }) => {
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

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/checkAuth');
        if (response.status === 200) {
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
      axios.get(`/api/dashboard/${accountId}/analytics`)
        .then((response) => {
          setData(response.data);
        })
        .catch((error) => {
          setError("Error fetching analytics data.");
        });
    }
  }, [accountId, isAuthenticated]);

  // Data for the Bar Chart (Expenses by Category)
  const barChartData = {
    labels: Object.keys(data.expensesByCategory),
    datasets: [
      {
        label: "Expenses by Category",
        data: Object.values(data.expensesByCategory),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Data for the Line Chart (Initial Balance vs Current Balance)
  const lineChartData = {
    labels: ["Initial Balance", "Current Balance"],
    datasets: [
      {
        label: "Balance",
        data: [data.initialBalance, data.currentBalance],
        borderColor: "#4BC0C0",
        fill: false,
      },
    ],
  };

  // Data for the Pie Chart (Expense Distribution)
  const pieChartData = {
    labels: Object.keys(data.expensesByCategory),
    datasets: [
      {
        data: Object.values(data.expensesByCategory),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56"],
      },
    ],
  };

  // Data for the Monthly Spending Trend (Line Chart)
  const monthlySpendingData = {
    labels: Object.keys(data.monthlySpending),
    datasets: [
      {
        label: "Monthly Spending",
        data: Object.values(data.monthlySpending),
        borderColor: "#FF6384",
        fill: false,
      },
    ],
  };

  // Chart options to control responsiveness and size
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Disable aspect ratio to control height and width
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <ErrorMessage message={error} onClose={() => setError('')} />
      <h2 className="text-2xl font-bold mb-4 cursor-pointer">Expense Analytics</h2>

      {/* Expenses by Category (Bar Chart) and Balance Overview (Line Chart) */}
      <div className="flex flex-col md:flex-row md:gap-8">
        {/* Bar Chart */}
        <div className="mb-8 md:flex-1"> 
          <h3 className="text-xl font-semibold mb-2 cursor-pointer">Expenses by Category</h3>
          <div className="w-full h-96"> 
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="mb-8 md:flex-1"> 
          <h3 className="text-xl font-semibold mb-2 cursor-pointer">Balance Overview</h3>
          <div className="w-full h-96"> 
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Expense Distribution (Pie Chart) */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2 cursor-pointer">Expense Distribution</h3>
        <div className="w-full h-96"> 
          <Pie data={pieChartData} options={chartOptions} />
        </div>
      </div>

      {/* Monthly Spending Trend (Line Chart) */}
      <div>
        <h3 className="text-xl font-semibold mb-2 cursor-pointer">Monthly Spending Trend</h3>
        <div className="w-full h-96"> 
          <Line data={monthlySpendingData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
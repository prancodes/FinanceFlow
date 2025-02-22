import React, { useEffect, useState } from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import axios from "axios";
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
  const [data, setData] = useState({
    initialBalance: 0,
    currentBalance: 0,
    expensesByCategory: {},
    monthlySpending: {},
  });

  useEffect(() => {
    // Fetch analytics data from the backend
    axios.get(`/api/dashboard/${userId}/analytics`)
      .then((response) => {
        console.log("Analytics Data:", response.data); // Debugging
        setData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching analytics data:", error);
      });
  }, [userId]);

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

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Expense Analytics</h2>

      {/* Expenses by Category (Bar Chart) */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Expenses by Category</h3>
        <Bar data={barChartData} />
      </div>

      {/* Initial Balance vs Current Balance (Line Chart) */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Balance Overview</h3>
        <Line data={lineChartData} />
      </div>

      {/* Expense Distribution (Pie Chart) */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2">Expense Distribution</h3>
        <Pie data={pieChartData} />
      </div>

      {/* Monthly Spending Trend (Line Chart) */}
      <div>
        <h3 className="text-xl font-semibold mb-2">Monthly Spending Trend</h3>
        <Line data={monthlySpendingData} />
      </div>
    </div>
  );
};

export default Analytics;
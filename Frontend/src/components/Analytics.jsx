import { useState, useEffect } from 'react';
import { analyticsService } from '../services/api';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Title, BarElement } from 'chart.js';
import { Pie, Line, Bar } from 'react-chartjs-2';
import { BarChart3, PieChart, TrendingUp, Calendar } from 'lucide-react';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  BarElement
);

const Analytics = () => {
  const [categoryData, setCategoryData] = useState([]);
  const [monthlyData, setMonthlyData] = useState({});
  const [trendsData, setTrendsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [categories, monthly, trends] = await Promise.all([
        analyticsService.getCategorySummary(dateRange.startDate, dateRange.endDate),
        analyticsService.getMonthlySummary(),
        analyticsService.getSpendingTrends(30),
      ]);

      setCategoryData(categories.categoryData);
      setMonthlyData(monthly.monthlyData);
      setTrendsData(trends.trendData);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = () => {
    fetchAnalyticsData();
  };

  const pieChartData = {
    labels: categoryData.map(item => item.category),
    datasets: [
      {
        data: categoryData.map(item => item.total),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
          '#4BC0C0',
          '#FF6384',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(context.parsed);
            return `${label}: ${value}`;
          }
        }
      }
    },
  };

  const monthlyChartData = {
    labels: Object.keys(monthlyData).map(month => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[parseInt(month) - 1];
    }),
    datasets: [
      {
        label: 'Income',
        data: Object.values(monthlyData).map(data => data.income),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 2,
      },
      {
        label: 'Expenses',
        data: Object.values(monthlyData).map(data => data.expense),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
      },
    ],
  };

  const monthlyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Income vs Expenses',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(value);
          }
        }
      },
    },
  };

  const trendChartData = {
    labels: trendsData.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Daily Expenses',
        data: trendsData.map(item => item.total),
        borderColor: 'rgba(99, 102, 241, 1)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const trendChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Spending Trends (Last 30 Days)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
            }).format(value);
          }
        }
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow-lg card-hover p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Calendar className="h-5 w-5" />
          <h2 className="text-lg font-semibold">Date Range Filter</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleDateFilter}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expenses by Category */}
        <div className="bg-white rounded-lg shadow-lg card-hover p-6">
          <div className="flex items-center space-x-2 mb-4">
            <PieChart className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Expenses by Category</h2>
          </div>
          {categoryData.length > 0 ? (
            <div className="h-80">
              <Pie data={pieChartData} options={pieChartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No expense data available for the selected period</p>
            </div>
          )}
        </div>

        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow-lg card-hover p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Monthly Overview</h2>
          </div>
          {Object.keys(monthlyData).length > 0 ? (
            <div className="h-80">
              <Bar data={monthlyChartData} options={monthlyChartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No monthly data available</p>
            </div>
          )}
        </div>

        {/* Spending Trends */}
        <div className="bg-white rounded-lg shadow-lg card-hover p-6 lg:col-span-2">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5" />
            <h2 className="text-xl font-semibold">Spending Trends</h2>
          </div>
          {trendsData.length > 0 ? (
            <div className="h-80">
              <Line data={trendChartData} options={trendChartOptions} />
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center text-gray-500">
              <p>No trend data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Category Summary Table */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg card-hover p-6">
          <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transactions
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categoryData.map((item, index) => {
                  const total = categoryData.reduce((sum, cat) => sum + cat.total, 0);
                  const percentage = ((item.total / total) * 100).toFixed(1);
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Intl.NumberFormat('en-IN', {
                          style: 'currency',
                          currency: 'INR',
                        }).format(item.total)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.count}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {percentage}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

import { useState, useEffect } from 'react';
import { analyticsService, transactionService } from '../services/api';
import { DollarSign, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const [summary, setSummary] = useState({
    income: { total: 0, count: 0 },
    expense: { total: 0, count: 0 },
    balance: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryData, transactionsData] = await Promise.all([
        analyticsService.getSummary(),
        transactionService.getTransactions({ limit: 5 }),
      ]);

      setSummary(summaryData.summary);
      setRecentTransactions(transactionsData.transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getTransactionIcon = (type) => {
    return type === 'income' ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    );
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
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-400 to-green-600 rounded-lg shadow-lg card-hover p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.income.total)}</p>
              <p className="text-green-100 text-xs">{summary.income.count} transactions</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-red-400 to-red-600 rounded-lg shadow-lg card-hover p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.expense.total)}</p>
              <p className="text-red-100 text-xs">{summary.expense.count} transactions</p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className={`bg-gradient-to-r ${
          summary.balance >= 0 
            ? 'from-blue-400 to-blue-600' 
            : 'from-orange-400 to-orange-600'
        } rounded-lg shadow-lg card-hover p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/80 text-sm font-medium">Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.balance)}</p>
              <p className="text-white/80 text-xs">
                {summary.balance >= 0 ? 'Positive' : 'Negative'} balance
              </p>
            </div>
            <div className="bg-white/20 p-3 rounded-full">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow-lg card-hover">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Transactions
          </h2>
        </div>
        <div className="p-6">
          {recentTransactions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No transactions yet. Add your first transaction to get started!
            </p>
          ) : (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-gray-900">{transaction.category}</p>
                      {transaction.description && (
                        <p className="text-sm text-gray-500">{transaction.description}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {format(new Date(transaction.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">{transaction.type}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

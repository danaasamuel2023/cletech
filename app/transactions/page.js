// app/transactions/page.js - Complete Transaction History Table
'use client';

import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, ArrowDownRight, Filter, Download, RefreshCw,
  Calendar, DollarSign, TrendingUp, TrendingDown, Activity,
  CreditCard, Wallet, CheckCircle, XCircle, Clock, AlertCircle,
  ChevronLeft, ChevronRight, Search, FileText, Loader2,
  ArrowUp, ArrowDown, Info, Eye, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState(null);
  const [currentBalance, setCurrentBalance] = useState(0);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    from: '',
    to: '',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [sortConfig, setSortConfig] = useState({
    sortBy: 'createdAt',
    order: 'desc'
  });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [exporting, setExporting] = useState(false);

  const transactionTypes = [
    { value: '', label: 'All Types' },
    { value: 'deposit', label: 'Deposit', icon: ArrowDownRight, color: 'green' },
    { value: 'withdrawal', label: 'Withdrawal', icon: ArrowUpRight, color: 'red' },
    { value: 'purchase', label: 'Purchase', icon: CreditCard, color: 'blue' },
    { value: 'refund', label: 'Refund', icon: RefreshCw, color: 'purple' },
    { value: 'commission', label: 'Commission', icon: TrendingUp, color: 'orange' },
    { value: 'agent_profit', label: 'Agent Profit', icon: DollarSign, color: 'teal' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'completed', label: 'Completed', color: 'green' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'processing', label: 'Processing', color: 'blue' },
    { value: 'failed', label: 'Failed', color: 'red' },
    { value: 'cancelled', label: 'Cancelled', color: 'gray' }
  ];

  useEffect(() => {
    fetchTransactions();
  }, [filters, pagination.page, sortConfig]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        sortBy: sortConfig.sortBy,
        order: sortConfig.order,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(`https://api.cletech.shop/api/transactions?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setTransactions(data.data.transactions);
        setStatistics(data.data.statistics);
        setCurrentBalance(data.data.currentBalance);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortConfig(prev => ({
      sortBy: field,
      order: prev.sortBy === field && prev.order === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      });

      const response = await fetch(
        `https://api.cletech.shop/api/transactions/export/${format}?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transactions-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `GHS ${(amount || 0).toFixed(2)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: ArrowDownRight,
      withdrawal: ArrowUpRight,
      purchase: CreditCard,
      refund: RefreshCw,
      commission: TrendingUp,
      agent_profit: DollarSign,
      transfer: ArrowUpRight,
      admin_credit: ArrowDownRight,
      admin_debit: ArrowUpRight,
      momo: Wallet
    };
    return icons[type] || Activity;
  };

  const getTransactionColor = (type) => {
    const colors = {
      deposit: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      withdrawal: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      purchase: 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30',
      refund: 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30',
      commission: 'text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/30',
      agent_profit: 'text-teal-600 bg-teal-100 dark:text-teal-400 dark:bg-teal-900/30',
      admin_credit: 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30',
      admin_debit: 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30',
      momo: 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
    };
    return colors[type] || 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      processing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return badges[status] || badges.pending;
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700"
    >
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg bg-${color}-100 dark:bg-${color}-900/30`}>
          <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
        </div>
        {trend && (
          <span className={`text-xs flex items-center ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Transaction History
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all your transactions
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            icon={Wallet}
            label="Current Balance"
            value={formatCurrency(currentBalance)}
            color="purple"
          />
          <StatCard
            icon={ArrowDownRight}
            label="Total Deposits"
            value={formatCurrency(statistics?.totalDeposits || 0)}
            color="green"
          />
          <StatCard
            icon={CreditCard}
            label="Total Purchases"
            value={formatCurrency(statistics?.totalPurchases || 0)}
            color="blue"
          />
          <StatCard
            icon={TrendingUp}
            label="Commissions"
            value={formatCurrency(statistics?.totalCommissions || 0)}
            color="orange"
          />
          <StatCard
            icon={Activity}
            label="Total Transactions"
            value={statistics?.totalTransactions || 0}
            color="gray"
          />
        </div>

        {/* Filters and Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {Object.values(filters).filter(v => v).length > 0 && (
                  <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {Object.values(filters).filter(v => v).length}
                  </span>
                )}
              </button>

              <button
                onClick={fetchTransactions}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('csv')}
                disabled={exporting}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Expandable Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Transaction Type
                    </label>
                    <select
                      value={filters.type}
                      onChange={(e) => setFilters({...filters, type: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {transactionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={filters.status}
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={filters.from}
                      onChange={(e) => setFilters({...filters, from: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={filters.to}
                      onChange={(e) => setFilters({...filters, to: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setFilters({ type: '', status: '', from: '', to: '', search: '' })}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Transactions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date/Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                    onClick={() => handleSort('amount')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Amount</span>
                      {sortConfig.sortBy === 'amount' && (
                        sortConfig.order === 'desc' ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance Before
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance After
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
                      <p className="mt-2 text-gray-500 dark:text-gray-400">Loading transactions...</p>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center">
                      <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => {
                    const Icon = getTransactionIcon(transaction.type);
                    const isCredit = ['deposit', 'refund', 'commission', 'agent_profit', 'admin_credit', 'momo'].includes(transaction.type);
                    
                    return (
                      <motion.tr
                        key={transaction.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatDate(transaction.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <div className={`p-2 rounded-lg ${getTransactionColor(transaction.type)}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                              {transaction.type.replace('_', ' ')}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                          <div>
                            {transaction.description}
                            {transaction.relatedPurchase && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {transaction.relatedPurchase.network} - {transaction.relatedPurchase.capacity}GB
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm font-bold ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                            {isCredit ? '+' : '-'} {formatCurrency(transaction.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(transaction.balanceBefore)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(transaction.balanceAfter)}
                          </div>
                          <div className={`text-xs ${transaction.balanceAfter > transaction.balanceBefore ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.balanceAfter > transaction.balanceBefore ? '↑' : '↓'} 
                            {Math.abs(transaction.balanceAfter - transaction.balanceBefore).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                            {transaction.reference.substring(0, 12)}...
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => setSelectedTransaction(transaction)}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} transactions
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                    const pageNumber = i + 1;
                    return (
                      <button
                        key={pageNumber}
                        onClick={() => setPagination(prev => ({ ...prev, page: pageNumber }))}
                        className={`px-3 py-1 rounded-lg ${
                          pagination.page === pageNumber
                            ? 'bg-purple-600 text-white'
                            : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction Detail Modal */}
        <AnimatePresence>
          {selectedTransaction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedTransaction(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-lg"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Transaction Details
                  </h2>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {selectedTransaction && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Reference</span>
                      <code className="text-sm font-mono text-gray-900 dark:text-white">
                        {selectedTransaction.reference}
                      </code>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Type</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {selectedTransaction.type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Status</p>
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusBadge(selectedTransaction.status)}`}>
                          {selectedTransaction.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Amount</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(selectedTransaction.amount)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Balance Before</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(selectedTransaction.balanceBefore)}
                        </p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Balance After</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(selectedTransaction.balanceAfter)}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Description</p>
                      <p className="text-gray-900 dark:text-white">
                        {selectedTransaction.description}
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Date & Time</p>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(selectedTransaction.timestamp)}
                      </p>
                    </div>

                    {selectedTransaction.gateway && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Payment Method</p>
                        <p className="text-gray-900 dark:text-white capitalize">
                          {selectedTransaction.gateway}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
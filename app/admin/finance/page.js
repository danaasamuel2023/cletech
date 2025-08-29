// app/admin/finance/page.js - Finance Management with Dark Mode
'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, Wallet, TrendingUp, ArrowUpRight, ArrowDownRight,
  CreditCard, Users, Clock, CheckCircle, XCircle, AlertCircle,
  Search, Filter, Download, RefreshCw, PieChart, BarChart3,
  Calendar, Plus, Minus, Eye, Send, FileText, Shield, ShoppingCart
} from 'lucide-react';
import Link from 'next/link';

export default function FinanceManagement() {
  const [activeTab, setActiveTab] = useState('transactions');
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [profits, setProfits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalVolume: 0,
    pendingWithdrawals: 0,
    totalWalletBalance: 0,
    totalProfits: 0,
    pendingProfits: 0
  });

  useEffect(() => {
    fetchFinanceData();
  }, [activeTab, filters]);

  const fetchFinanceData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockTransactions = [
        {
          _id: '1',
          userId: { name: 'John Doe', email: 'john@example.com', phoneNumber: '0241234567' },
          type: 'deposit',
          amount: 500,
          balanceBefore: 100,
          balanceAfter: 600,
          status: 'completed',
          reference: 'TXN-20250121-001',
          gateway: 'paystack',
          createdAt: new Date()
        },
        {
          _id: '2',
          userId: { name: 'Jane Smith', email: 'jane@example.com', phoneNumber: '0501234567' },
          type: 'purchase',
          amount: 25,
          balanceBefore: 200,
          balanceAfter: 175,
          status: 'completed',
          reference: 'TXN-20250121-002',
          gateway: 'wallet',
          createdAt: new Date()
        },
        {
          _id: '3',
          userId: { name: 'Bob Johnson', email: 'bob@example.com', phoneNumber: '0271234567' },
          type: 'withdrawal',
          amount: 150,
          balanceBefore: 300,
          balanceAfter: 150,
          status: 'pending',
          reference: 'TXN-20250121-003',
          gateway: 'bank',
          createdAt: new Date()
        }
      ];

      const mockWallets = [
        {
          _id: '1',
          user: { name: 'John Doe', email: 'john@example.com', role: 'agent' },
          balance: 600,
          totalDeposits: 5000,
          totalWithdrawals: 4400,
          lastActivity: new Date()
        },
        {
          _id: '2',
          user: { name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
          balance: 175,
          totalDeposits: 1000,
          totalWithdrawals: 825,
          lastActivity: new Date()
        }
      ];

      const mockProfits = [
        {
          _id: '1',
          agentId: { name: 'John Doe', email: 'john@example.com' },
          purchaseId: { reference: 'PURCHASE-001' },
          network: 'MTN',
          capacity: 5,
          systemPrice: 20,
          agentPrice: 25,
          profit: 5,
          status: 'credited',
          createdAt: new Date()
        },
        {
          _id: '2',
          agentId: { name: 'Jane Smith', email: 'jane@example.com' },
          purchaseId: { reference: 'PURCHASE-002' },
          network: 'TELECEL',
          capacity: 2,
          systemPrice: 10,
          agentPrice: 12,
          profit: 2,
          status: 'pending',
          createdAt: new Date()
        }
      ];

      const mockWithdrawals = [
        {
          _id: '1',
          user: { name: 'John Doe', email: 'john@example.com' },
          amount: 500,
          method: 'bank',
          accountDetails: { bank: 'GCB Bank', accountNumber: '****1234' },
          status: 'pending',
          requestedAt: new Date()
        },
        {
          _id: '2',
          user: { name: 'Jane Smith', email: 'jane@example.com' },
          amount: 200,
          method: 'momo',
          accountDetails: { provider: 'MTN', number: '0501234567' },
          status: 'processing',
          requestedAt: new Date()
        }
      ];

      setTransactions(mockTransactions);
      setWallets(mockWallets);
      setProfits(mockProfits);
      setWithdrawals(mockWithdrawals);

      setStats({
        totalTransactions: 12345,
        totalVolume: 456789.50,
        pendingWithdrawals: 45,
        totalWalletBalance: 89012.35,
        totalProfits: 12345.67,
        pendingProfits: 2345.67
      });
    } catch (error) {
      console.error('Error fetching finance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreditWallet = async (userId, amount, description) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/wallet/credit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, amount, description })
      });
      
      if (response.ok) {
        fetchFinanceData();
        setShowCreditModal(false);
        // Show success notification
      }
    } catch (error) {
      console.error('Error crediting wallet:', error);
    }
  };

  const handleDebitWallet = async (userId, amount, description) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/wallet/debit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, amount, description })
      });
      
      if (response.ok) {
        fetchFinanceData();
        // Show success notification
      }
    } catch (error) {
      console.error('Error debiting wallet:', error);
    }
  };

  const handleProcessWithdrawal = async (withdrawalId, action) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/admin/withdrawals/${withdrawalId}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        fetchFinanceData();
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { icon: CheckCircle, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
      pending: { icon: Clock, color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
      processing: { icon: RefreshCw, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30' },
      failed: { icon: XCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
      credited: { icon: CheckCircle, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
      withdrawn: { icon: ArrowUpRight, color: 'text-purple-500 dark:text-purple-400', bg: 'bg-purple-100 dark:bg-purple-900/30' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}>
        <Icon className={`w-3 h-3 mr-1 ${badge.color}`} />
        <span className={badge.color.replace('dark:', '')}>{status}</span>
      </span>
    );
  };

  const getTransactionIcon = (type) => {
    const icons = {
      deposit: { icon: ArrowDownRight, color: 'text-green-500 dark:text-green-400' },
      withdrawal: { icon: ArrowUpRight, color: 'text-red-500 dark:text-red-400' },
      purchase: { icon: ShoppingCart, color: 'text-blue-500 dark:text-blue-400' },
      admin_credit: { icon: Plus, color: 'text-green-500 dark:text-green-400' },
      admin_debit: { icon: Minus, color: 'text-red-500 dark:text-red-400' },
      refund: { icon: RefreshCw, color: 'text-purple-500 dark:text-purple-400' },
      agent_profit: { icon: TrendingUp, color: 'text-indigo-500 dark:text-indigo-400' }
    };
    const item = icons[type] || { icon: DollarSign, color: 'text-gray-500 dark:text-gray-400' };
    const Icon = item.icon;
    return <Icon className={`w-5 h-5 ${item.color}`} />;
  };

  const WalletActionModal = () => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [actionType, setActionType] = useState('credit');

    if (!selectedUser) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Wallet Action</h2>
            <button
              onClick={() => setShowCreditModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
              <p className="font-medium text-gray-900 dark:text-white">{selectedUser.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{selectedUser.email}</p>
              <p className="text-sm mt-2">
                <span className="text-gray-500 dark:text-gray-400">Current Balance:</span>
                <span className="font-semibold ml-2 text-gray-900 dark:text-white">
                  GHS {selectedUser.balance?.toFixed(2) || '0.00'}
                </span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActionType('credit')}
                  className={`p-3 border rounded-lg transition-colors ${
                    actionType === 'credit' 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Plus className="w-5 h-5 mx-auto mb-1" />
                  Credit
                </button>
                <button
                  onClick={() => setActionType('debit')}
                  className={`p-3 border rounded-lg transition-colors ${
                    actionType === 'debit' 
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400' 
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Minus className="w-5 h-5 mx-auto mb-1" />
                  Debit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount (GHS)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                rows="3"
                placeholder="Reason for this transaction..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (actionType === 'credit') {
                    handleCreditWallet(selectedUser._id, parseFloat(amount), description);
                  } else {
                    handleDebitWallet(selectedUser._id, parseFloat(amount), description);
                  }
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  actionType === 'credit'
                    ? 'bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600'
                    : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600'
                }`}
              >
                {actionType === 'credit' ? 'Credit Wallet' : 'Debit Wallet'}
              </button>
              <button
                onClick={() => setShowCreditModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finance Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage transactions, wallets, and financial operations
            </p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
            <Link
              href="/admin/finance/analytics"
              className="px-4 py-2 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors flex items-center space-x-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Volume</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                GHS {stats.totalVolume.toFixed(0)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Transactions</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalTransactions.toLocaleString()}
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Wallets</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                GHS {stats.totalWalletBalance.toFixed(0)}
              </p>
            </div>
            <Wallet className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Profits</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                GHS {stats.totalProfits.toFixed(0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingWithdrawals}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Profits</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                GHS {stats.pendingProfits.toFixed(0)}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'transactions'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('wallets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'wallets'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Wallet Management
          </button>
          <button
            onClick={() => setActiveTab('profits')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'profits'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Agent Profits
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`py-2 px-1 border-b-2 font-medium text-sm relative transition-colors ${
              activeTab === 'withdrawals'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Withdrawals
            {stats.pendingWithdrawals > 0 && (
              <span className="absolute -top-1 -right-2 px-2 py-0.5 text-xs bg-red-500 dark:bg-red-600 text-white rounded-full">
                {stats.pendingWithdrawals}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'transactions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search transactions..."
                    value={filters.search}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                  />
                </div>
              </div>

              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="purchase">Purchase</option>
                <option value="refund">Refund</option>
                <option value="agent_profit">Agent Profit</option>
              </select>

              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="failed">Failed</option>
              </select>

              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Gateway
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getTransactionIcon(transaction.type)}
                          <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">
                            {transaction.type.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {transaction.userId?.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {transaction.userId?.phoneNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className={`text-sm font-semibold ${
                          transaction.type.includes('deposit') || transaction.type.includes('credit')
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type.includes('deposit') || transaction.type.includes('credit') ? '+' : '-'}
                          GHS {transaction.amount.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <p className="text-gray-500 dark:text-gray-400">
                            Before: {transaction.balanceBefore.toFixed(2)}
                          </p>
                          <p className="font-medium text-gray-900 dark:text-white">
                            After: {transaction.balanceAfter.toFixed(2)}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-mono text-gray-900 dark:text-white">
                          {transaction.reference}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {transaction.gateway}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-900 dark:text-white">
                          {new Date(transaction.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(transaction.createdAt).toLocaleTimeString()}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'wallets' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">User Wallets</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Deposits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Total Withdrawals
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Last Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {wallets.map((wallet) => (
                  <tr key={wallet._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {wallet.user.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {wallet.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 capitalize">
                        {wallet.user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        GHS {wallet.balance.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        +GHS {wallet.totalDeposits.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-red-600 dark:text-red-400">
                        -GHS {wallet.totalWithdrawals.toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(wallet.lastActivity).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(wallet.user);
                            setSelectedUser(prev => ({...prev, balance: wallet.balance, _id: wallet._id}));
                            setShowCreditModal(true);
                          }}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                        >
                          <Wallet className="w-5 h-5" />
                        </button>
                        <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                          <Eye className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'profits' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Purchase
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    System Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Agent Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Profit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {profits.map((profit) => (
                  <tr key={profit._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {profit.agentId?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {profit.agentId?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                        {profit.purchaseId?.reference}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300">
                          {profit.network}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">{profit.capacity}GB</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">GHS {profit.systemPrice}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">GHS {profit.agentPrice}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        +GHS {profit.profit}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(profit.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(profit.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'withdrawals' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Account Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {withdrawal.user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {withdrawal.user.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        GHS {withdrawal.amount}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white capitalize">
                        {withdrawal.method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {withdrawal.method === 'bank' ? (
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">{withdrawal.accountDetails.bank}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {withdrawal.accountDetails.accountNumber}
                          </p>
                        </div>
                      ) : (
                        <div className="text-sm">
                          <p className="text-gray-900 dark:text-white">{withdrawal.accountDetails.provider}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {withdrawal.accountDetails.number}
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(withdrawal.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(withdrawal.requestedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {withdrawal.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleProcessWithdrawal(withdrawal._id, 'approve')}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleProcessWithdrawal(withdrawal._id, 'reject')}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreditModal && <WalletActionModal />}
    </div>
  );
}
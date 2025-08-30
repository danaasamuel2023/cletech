// app/admin/users/[userId]/purchases/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShoppingCart, User, Filter, Download, TrendingUp,
  Calendar, Package, DollarSign, Clock, CheckCircle,
  XCircle, RefreshCw, ArrowLeft, ToggleLeft, ToggleRight,
  Smartphone, CreditCard, Wallet, Globe, AlertCircle
} from 'lucide-react';

export default function UserPurchases() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId;
  
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [todayOnly, setTodayOnly] = useState(false);
  const [filters, setFilters] = useState({
    network: '',
    status: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 50
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserPurchases();
    }
  }, [userId, todayOnly, filters]);

  // In app/admin/users/[userId]/purchases/page.js - Update the fetchUserPurchases function

const fetchUserPurchases = async () => {
  setLoading(true);
  setError(null);
  try {
    const token = localStorage.getItem('token');
    const queryParams = new URLSearchParams({
      todayOnly: todayOnly.toString(),
      ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''))
    });

    const response = await fetch(
      `https://cletech-server.onrender.com/api/admin/users/${userId}/purchases?${queryParams}`,
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    if (response.ok) {
      const data = await response.json();
      
      // Debug logging
      console.log('User purchases response:', data);
      console.log('Statistics:', data.data.statistics);
      console.log('Purchases count:', data.data.purchases?.length);
      
      setUserInfo(data.data.user);
      setPurchases(data.data.purchases || []);
      setStatistics(data.data.statistics);
    } else if (response.status === 404) {
      setError('User not found');
    } else {
      setError('Failed to fetch user purchases');
    }
  } catch (error) {
    console.error('Error fetching user purchases:', error);
    setError('An error occurred while fetching data');
  } finally {
    setLoading(false);
  }
};
  const fetchUserSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://cletech-server.onrender.com/api/admin/users/${userId}/purchases/summary?days=30`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('User summary:', data.data.summary);
        // You can display this summary in a modal or separate section
      }
    } catch (error) {
      console.error('Error fetching user summary:', error);
    }
  };

  const exportToCSV = () => {
    // Create CSV content
    const headers = ['Reference', 'Network', 'Capacity (GB)', 'Amount (GHS)', 'Phone Number', 'Status', 'Date'];
    const rows = purchases.map(p => [
      p.reference,
      p.network,
      p.capacity,
      p.price,
      p.phoneNumber,
      p.status,
      new Date(p.createdAt).toLocaleString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_${userId}_purchases_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status) => {
    const badges = {
      completed: { 
        icon: CheckCircle, 
        color: 'text-green-500 dark:text-green-400', 
        bg: 'bg-green-100 dark:bg-green-900/30' 
      },
      pending: { 
        icon: Clock, 
        color: 'text-yellow-500 dark:text-yellow-400', 
        bg: 'bg-yellow-100 dark:bg-yellow-900/30' 
      },
      failed: { 
        icon: XCircle, 
        color: 'text-red-500 dark:text-red-400', 
        bg: 'bg-red-100 dark:bg-red-900/30' 
      },
      refunded: { 
        icon: RefreshCw, 
        color: 'text-purple-500 dark:text-purple-400', 
        bg: 'bg-purple-100 dark:bg-purple-900/30' 
      }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}>
        <Icon className={`w-3 h-3 mr-1 ${badge.color}`} />
        <span className={badge.color}>{status}</span>
      </span>
    );
  };

  const getNetworkColor = (network) => {
    const colors = {
      MTN: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      TELECEL: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
      AT: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
      AIRTELTIGO: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
      YELLO: 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300',
      AT_PREMIUM: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300'
    };
    return colors[network] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
  };

  const getPaymentIcon = (gateway) => {
    const icons = {
      wallet: Wallet,
      momo: Smartphone,
      card: CreditCard,
      default: Globe
    };
    const Icon = icons[gateway] || icons.default;
    return <Icon className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Error</h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={() => router.push('/admin/users')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header with User Info */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={() => router.push('/admin/users')}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Purchase History</h1>
        </div>

        {/* User Info Card */}
        {userInfo && (
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{userInfo.name}</h2>
                    <p className="text-purple-100">{userInfo.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-purple-200 text-sm">Phone Number</p>
                    <p className="font-semibold">{userInfo.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-purple-200 text-sm">Role</p>
                    <p className="font-semibold capitalize">{userInfo.role}</p>
                  </div>
                  <div>
                    <p className="text-purple-200 text-sm">Wallet Balance</p>
                    <p className="text-2xl font-bold">GHS {userInfo.walletBalance?.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={exportToCSV}
                  className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toggle for Today Only */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setTodayOnly(!todayOnly)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                todayOnly 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {todayOnly ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
              <span>Today Only</span>
            </button>
            <button
              onClick={fetchUserSummary}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              View 30-Day Summary
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.overall?.totalPurchases || 0}
                </p>
                {!todayOnly && statistics.today && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    +{statistics.today.todayCount || 0} today
                  </p>
                )}
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  GHS {statistics.overall?.totalAmount?.toFixed(2) || '0.00'}
                </p>
                {!todayOnly && statistics.today && (
                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                    +GHS {statistics.today.todayTotal?.toFixed(2) || '0.00'} today
                  </p>
                )}
              </div>
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Purchase</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  GHS {statistics.overall?.avgPurchaseValue?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Data</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {statistics.overall?.totalCapacity || 0} GB
                </p>
              </div>
              <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {/* Network Breakdown */}
      {statistics?.byNetwork && statistics.byNetwork.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Network Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {statistics.byNetwork.map((network) => (
              <div key={network._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getNetworkColor(network._id)}`}>
                    {network._id}
                  </span>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {network.count} purchases • {network.totalCapacity}GB
                  </p>
                </div>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  GHS {network.totalAmount?.toFixed(2) || '0.00'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <select
            value={filters.network}
            onChange={(e) => setFilters({...filters, network: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Networks</option>
            <option value="MTN">MTN</option>
            <option value="TELECEL">TELECEL</option>
            <option value="AT">AT</option>
            <option value="AIRTELTIGO">AIRTELTIGO</option>
            <option value="YELLO">YELLO</option>
            <option value="AT_PREMIUM">AT PREMIUM</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            disabled={todayOnly}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />

          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({...filters, endDate: e.target.value})}
            disabled={todayOnly}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
          />

          <button
            onClick={() => setFilters({
              network: '',
              status: '',
              startDate: '',
              endDate: '',
              page: 1,
              limit: 50
            })}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Network & Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Phone Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Payment
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
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No purchases found {todayOnly ? 'for today' : 'for this period'}
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-mono font-medium text-gray-900 dark:text-white">
                        {purchase.reference}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getNetworkColor(purchase.network)
                        }`}>
                          {purchase.network}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {purchase.capacity}GB
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {purchase.phoneNumber}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        GHS {purchase.price}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getPaymentIcon(purchase.gateway)}
                        <span className="text-sm text-gray-900 dark:text-white capitalize">
                          {purchase.gateway}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(purchase.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(purchase.createdAt).toLocaleTimeString()}
                      </p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
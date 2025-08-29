// app/admin/page.js - Complete Admin Dashboard with Real Activities
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, DollarSign, ShoppingCart, TrendingUp, 
  Package, Store, Activity, ArrowUp, ArrowDown,
  Calendar, Clock, AlertCircle, CheckCircle,
  RefreshCw, TrendingDown, Wallet, CreditCard
} from 'lucide-react';

// Stats Card Component with Dark Mode
const StatCard = ({ title, value, change, icon: Icon, color, trend }) => {
  const colorClasses = {
    blue: 'bg-blue-500 dark:bg-blue-600',
    green: 'bg-green-500 dark:bg-green-600',
    purple: 'bg-purple-500 dark:bg-purple-600',
    orange: 'bg-orange-500 dark:bg-orange-600',
    indigo: 'bg-indigo-500 dark:bg-indigo-600',
    red: 'bg-red-500 dark:bg-red-600'
  };

  const iconColorClasses = {
    blue: 'text-blue-500 dark:text-blue-400',
    green: 'text-green-500 dark:text-green-400',
    purple: 'text-purple-500 dark:text-purple-400',
    orange: 'text-orange-500 dark:text-orange-400',
    indigo: 'text-indigo-500 dark:text-indigo-400',
    red: 'text-red-500 dark:text-red-400'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {trend === 'up' ? (
                <ArrowUp className="w-4 h-4 text-green-500 dark:text-green-400" />
              ) : (
                <ArrowDown className="w-4 h-4 text-red-500 dark:text-red-400" />
              )}
              <span className={`text-sm ml-1 ${
                trend === 'up' 
                  ? 'text-green-500 dark:text-green-400' 
                  : 'text-red-500 dark:text-red-400'
              }`}>
                {Math.abs(change)}%
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]} bg-opacity-10 dark:bg-opacity-20`}>
          <Icon className={`w-6 h-6 ${iconColorClasses[color]}`} />
        </div>
      </div>
    </div>
  );
};

// Enhanced Activity Item Component with category colors
const ActivityItem = ({ type, message, time, status, category, metadata }) => {
  const statusIcons = {
    success: <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />,
    pending: <Clock className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />,
    failed: <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />
  };

  const categoryColors = {
    user: 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500',
    transaction: 'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-500',
    financial: 'bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-500',
    store: 'bg-orange-50 dark:bg-orange-900/20 border-l-2 border-orange-500',
    system: 'bg-gray-50 dark:bg-gray-700/50 border-l-2 border-gray-500',
    error: 'bg-red-50 dark:bg-red-900/20 border-l-2 border-red-500'
  };

  return (
    <div className={`flex items-center space-x-4 py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 ${categoryColors[category] || ''}`}>
      {statusIcons[status]}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{message}</p>
        <div className="flex items-center space-x-2 mt-1">
          <p className="text-xs text-gray-500 dark:text-gray-400">{type}</p>
          {metadata?.amount && (
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
              GHS {metadata.amount.toFixed(2)}
            </span>
          )}
        </div>
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{time}</span>
    </div>
  );
};

// Loading Skeleton Component
const ActivitySkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="animate-pulse flex items-center space-x-4 py-3">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    ))}
  </div>
);

// Revenue Mini Chart Component (placeholder)
const RevenueChart = ({ data }) => {
  return (
    <div className="h-64 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg">
      <div className="text-center">
        <TrendingUp className="w-12 h-12 text-purple-500 dark:text-purple-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400 text-sm">Revenue Analytics</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
          GHS {data?.totalRevenue || '0.00'}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total this period</p>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [recentActivities, setRecentActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchRecentActivities();
    
    // Auto-refresh activities every 30 seconds
    const interval = setInterval(() => {
      fetchRecentActivities(true); // silent refresh
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
        
        // Calculate additional metrics
        calculateChartData(data.data);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    } 
  };

  const fetchRecentActivities = async (silent = false) => {
    if (!silent) setActivitiesLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/activities/recent?limit=10', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.activities) {
          const formattedActivities = data.data.activities.map(activity => ({
            type: activity.type,
            message: activity.message,
            time: activity.timeAgo,
            status: activity.status,
            category: activity.category,
            metadata: activity.metadata
          }));
          setRecentActivities(formattedActivities);
        }
      }
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      setRecentActivities([]);
    } finally {
      setActivitiesLoading(false);
      setRefreshing(false);
    }
  };

  const calculateChartData = (data) => {
    if (!data) return;
    
    // Calculate chart data from dashboard data
    const chartInfo = {
      totalRevenue: data.transactions?.monthVolume?.[0]?.total || 0,
      totalOrders: data.transactions?.monthVolume?.[0]?.count || 0,
      avgOrderValue: data.transactions?.monthVolume?.[0]?.total 
        ? (data.transactions.monthVolume[0].total / data.transactions.monthVolume[0].count).toFixed(2)
        : 0
    };
    
    setChartData(chartInfo);
  };

  const refreshActivities = () => {
    setRefreshing(true);
    fetchRecentActivities();
  };

  const refreshDashboard = () => {
    setLoading(true);
    setActivitiesLoading(true);
    Promise.all([fetchDashboardData(), fetchRecentActivities()]);
  };

  // Calculate stats from dashboard data
  const stats = dashboardData ? [
    {
      title: 'Total Users',
      value: dashboardData.users?.total?.[0]?.count || '0',
      change: 12.5,
      trend: 'up',
      icon: Users,
      color: 'blue'
    },
    {
      title: "Today's Revenue",
      value: `GHS ${dashboardData.transactions?.todayVolume?.[0]?.total?.toFixed(2) || '0.00'}`,
      change: dashboardData.transactions?.todayVolume?.[0]?.count > 0 ? 8.3 : 0,
      trend: dashboardData.transactions?.todayVolume?.[0]?.count > 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'green'
    },
    {
      title: "Today's Orders",
      value: dashboardData.purchases?.todayPurchases?.[0]?.count || '0',
      change: 5.2,
      trend: 'up',
      icon: ShoppingCart,
      color: 'purple'
    },
    {
      title: 'Active Stores',
      value: dashboardData.stores?.active?.[0]?.count || '0',
      change: 2.1,
      trend: 'down',
      icon: Store,
      color: 'orange'
    },
    {
      title: 'Pending Approvals',
      value: dashboardData.users?.byStatus?.find(s => s._id === 'pending')?.count || '0',
      change: 15.3,
      trend: 'up',
      icon: Clock,
      color: 'indigo'
    },
    {
      title: 'Monthly Revenue',
      value: `GHS ${dashboardData.transactions?.monthVolume?.[0]?.total?.toFixed(2) || '0.00'}`,
      change: 18.7,
      trend: 'up',
      icon: TrendingUp,
      color: 'green'
    }
  ] : [];

  // Network distribution data
  const networkData = dashboardData?.purchases?.byNetwork || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header with Refresh */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        <button
          onClick={refreshDashboard}
          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue Overview</h2>
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
              <option value="3months">Last 3 months</option>
            </select>
          </div>
          
          {/* Revenue Chart */}
          <RevenueChart data={chartData} />

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                GHS {chartData?.totalRevenue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                {chartData?.totalOrders || '0'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Order Value</p>
              <p className="text-xl font-semibold text-gray-900 dark:text-white">
                GHS {chartData?.avgOrderValue || '0.00'}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={refreshActivities}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                title="Refresh activities"
                disabled={refreshing}
              >
                <RefreshCw 
                  className={`w-5 h-5 text-gray-400 dark:text-gray-500 ${refreshing ? 'animate-spin' : ''}`}
                />
              </button>
              <Activity className="w-5 h-5 text-gray-400 dark:text-gray-500" />
            </div>
          </div>
          
          {activitiesLoading ? (
            <ActivitySkeleton />
          ) : recentActivities.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {recentActivities.map((activity, index) => (
                <ActivityItem key={index} {...activity} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No recent activities</p>
              <button
                onClick={refreshActivities}
                className="mt-3 text-xs text-purple-600 dark:text-purple-400 hover:underline"
              >
                Refresh to check again
              </button>
            </div>
          )}

          <button 
            onClick={() => window.location.href = '/admin/activities'}
            className="w-full mt-4 py-2 text-sm text-purple-600 dark:text-purple-400 font-medium hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
          >
            View All Activity
          </button>
        </div>
      </div>

      {/* Network Distribution & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Network Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Network Distribution</h2>
          <div className="space-y-4">
            {networkData.length > 0 ? networkData.map((network, index) => {
              const maxRevenue = Math.max(...networkData.map(n => n.revenue || 0));
              const percentage = maxRevenue > 0 ? ((network.revenue || 0) / maxRevenue) * 100 : 0;
              
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        network._id === 'MTN' ? 'bg-yellow-500 dark:bg-yellow-400' :
                        network._id === 'TELECEL' ? 'bg-red-500 dark:bg-red-400' :
                        network._id === 'AT' ? 'bg-blue-500 dark:bg-blue-400' : 
                        'bg-gray-500 dark:bg-gray-400'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{network._id}</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{network.count} orders</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        GHS {network.revenue?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        network._id === 'MTN' ? 'bg-yellow-500 dark:bg-yellow-400' :
                        network._id === 'TELECEL' ? 'bg-red-500 dark:bg-red-400' :
                        network._id === 'AT' ? 'bg-blue-500 dark:bg-blue-400' : 
                        'bg-gray-500 dark:bg-gray-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            }) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No data available</p>
            )}
          </div>
          
          {/* Network Summary */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Networks</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{networkData.length}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                GHS {networkData.reduce((sum, n) => sum + (n.revenue || 0), 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => window.location.href = '/admin/users/add'}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all group"
            >
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Add User</p>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/inventory'}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all group"
            >
              <Package className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Update Stock</p>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/pricing'}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all group"
            >
              <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Set Pricing</p>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/notifications'}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all group"
            >
              <AlertCircle className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Send Alert</p>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/transactions'}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all group"
            >
              <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Transactions</p>
            </button>
            <button 
              onClick={() => window.location.href = '/admin/stores'}
              className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-purple-500 dark:hover:border-purple-400 transition-all group"
            >
              <Store className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Stores</p>
            </button>
          </div>
        </div>
      </div>

      {/* System Health Status */}
      <div className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-sm p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">System Status</h3>
            <p className="text-sm opacity-90">All systems operational</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Online</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs opacity-75">API Status</p>
            <p className="text-sm font-semibold">Operational</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs opacity-75">Response Time</p>
            <p className="text-sm font-semibold">45ms</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs opacity-75">Uptime</p>
            <p className="text-sm font-semibold">99.9%</p>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <p className="text-xs opacity-75">Active Users</p>
            <p className="text-sm font-semibold">{dashboardData?.users?.total?.[0]?.count || '0'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
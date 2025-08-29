// app/admin/users/page.js - Complete User Management with Enhanced UI
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, Search, Filter, Download, UserPlus, MoreVertical,
  CheckCircle, XCircle, Clock, Shield, AlertCircle, 
  Edit, Trash2, Mail, Phone, Calendar, ChevronLeft, ChevronRight,
  Ban, UserCheck, Key, DollarSign, Eye, EyeOff, X, 
  Sparkles, Activity, TrendingUp, Award, Settings,
  Zap, Crown, Star, Heart, Coffee, Rocket
} from 'lucide-react';

export default function UsersManagement() {
  // ==================== STATE MANAGEMENT ====================
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    approvalStatus: '',
    isDisabled: ''
  });
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [apiSettings, setApiSettings] = useState({
    enabled: false,
    tier: 'basic',
    rateLimit: 100
  });

  const [walletForm, setWalletForm] = useState({
    amount: '',
    description: ''
  });

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchUsers();
  }, [pagination.page, filters]);

  // ==================== API CALLS ====================
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...filters
      });
      
      const response = await fetch(`http://localhost:5000/api/admin/users?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId, status) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (response.ok) {
        fetchUsers();
        showNotification(`User ${status} successfully`, 'success');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Failed to update user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisableUser = async (userId, disable) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/disable`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ disable })
      });
      
      if (response.ok) {
        fetchUsers();
        showNotification(`User ${disable ? 'disabled' : 'enabled'} successfully`, 'success');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showNotification('Failed to update user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        fetchUsers();
        showNotification('Role updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showNotification('Failed to update role', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWalletAction = async (action) => {
    if (!walletForm.amount || !walletForm.description) {
      showNotification('Please fill all fields', 'warning');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/wallet/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          amount: parseFloat(walletForm.amount),
          description: walletForm.description
        })
      });
      
      if (response.ok) {
        setShowWalletModal(false);
        setWalletForm({ amount: '', description: '' });
        fetchUsers();
        showNotification(`Wallet ${action}ed successfully`, 'success');
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      showNotification('Failed to update wallet', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleApiAccess = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/users/${selectedUser._id}/api-access`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(apiSettings)
      });
      
      if (response.ok) {
        const data = await response.json();
        setShowApiModal(false);
        fetchUsers();
        
        if (data.data.apiKey && apiSettings.enabled) {
          showNotification(`API access enabled! Key: ${data.data.apiKey.key}`, 'success', 10000);
        } else {
          showNotification(`API access ${apiSettings.enabled ? 'enabled' : 'disabled'} successfully`, 'success');
        }
      }
    } catch (error) {
      console.error('Error updating API access:', error);
      showNotification('Failed to update API access', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== UTILITY FUNCTIONS ====================
  const showNotification = (message, type = 'info', duration = 3000) => {
    // Simple notification - you can replace with a toast library
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in ${
      type === 'success' ? 'bg-green-500 text-white' :
      type === 'error' ? 'bg-red-500 text-white' :
      type === 'warning' ? 'bg-yellow-500 text-white' :
      'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), duration);
  };

  const exportUsers = () => {
    const csvContent = users.map(user => 
      `${user.name},${user.email},${user.phoneNumber},${user.role},${user.approvalStatus}`
    ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  // ==================== STYLE CONFIGURATIONS ====================
  const roleConfig = {
    admin: { 
      color: 'bg-gradient-to-r from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 text-red-800 dark:text-red-300',
      icon: <Crown className="w-3 h-3" />
    },
    super_agent: { 
      color: 'bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 text-purple-800 dark:text-purple-300',
      icon: <Star className="w-3 h-3" />
    },
    dealer: { 
      color: 'bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 text-indigo-800 dark:text-indigo-300',
      icon: <Award className="w-3 h-3" />
    },
    agent: { 
      color: 'bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 text-blue-800 dark:text-blue-300',
      icon: <Shield className="w-3 h-3" />
    },
    user: { 
      color: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',
      icon: <Users className="w-3 h-3" />
    },
    reporter: { 
      color: 'bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-800 dark:text-green-300',
      icon: <Activity className="w-3 h-3" />
    },
    worker: { 
      color: 'bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-800 dark:text-yellow-300',
      icon: <Coffee className="w-3 h-3" />
    }
  };

  const statusColors = {
    approved: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800',
    rejected: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
  };

  // ==================== RENDER ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                User Management
              </h1>
            </div>
            <p className="text-gray-500 dark:text-gray-400 ml-11">
              Manage all users, roles, and permissions with ease
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={exportUsers}
              className="group flex items-center px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
              <span className="text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">Export</span>
            </button>
            <button className="group flex items-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
              <Sparkles className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Users', value: pagination.total, icon: Users, color: 'from-purple-500 to-pink-500', bgColor: 'from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20' },
          { label: 'Pending', value: '12', icon: Clock, color: 'from-orange-500 to-yellow-500', bgColor: 'from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20' },
          { label: 'Active Agents', value: '1,234', icon: UserCheck, color: 'from-green-500 to-emerald-500', bgColor: 'from-green-100 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20' },
          { label: 'Disabled', value: '45', icon: Ban, color: 'from-red-500 to-pink-500', bgColor: 'from-red-100 to-pink-100 dark:from-red-900/20 dark:to-pink-900/20' }
        ].map((stat, index) => (
          <div key={index} className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 hover:shadow-lg transition-all duration-200 overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-200`}></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <div className="flex items-center mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                  <span>+12% from last month</span>
                </div>
              </div>
              <div className={`p-3 bg-gradient-to-r ${stat.color} rounded-xl shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 mb-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, email, phone..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
              />
            </div>
          </div>
          
          <select
            value={filters.role}
            onChange={(e) => setFilters({...filters, role: e.target.value})}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200"
          >
            <option value="">🎭 All Roles</option>
            <option value="admin">👑 Admin</option>
            <option value="super_agent">⭐ Super Agent</option>
            <option value="dealer">🏆 Dealer</option>
            <option value="agent">🛡️ Agent</option>
            <option value="user">👤 User</option>
            <option value="reporter">📊 Reporter</option>
            <option value="worker">☕ Worker</option>
          </select>
          
          <select
            value={filters.approvalStatus}
            onChange={(e) => setFilters({...filters, approvalStatus: e.target.value})}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200"
          >
            <option value="">📋 All Status</option>
            <option value="pending">⏳ Pending</option>
            <option value="approved">✅ Approved</option>
            <option value="rejected">❌ Rejected</option>
          </select>
          
          <select
            value={filters.isDisabled}
            onChange={(e) => setFilters({...filters, isDisabled: e.target.value})}
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent transition-all duration-200"
          >
            <option value="">🔄 All Accounts</option>
            <option value="false">✨ Active</option>
            <option value="true">🚫 Disabled</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u._id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400"
                  />
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600 dark:border-purple-800 dark:border-t-purple-400 mb-4"></div>
                      <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-full mb-4">
                        <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No users found</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try adjusting your filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user._id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                          }
                        }}
                        className="rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold shadow-sm">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username || 'no-username'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                          <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
                          <span className="truncate max-w-[180px]">{user.email}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <Phone className="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
                          {user.phoneNumber}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${roleConfig[user.role]?.color || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'}`}>
                        {roleConfig[user.role]?.icon}
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          GHS {user.walletBalance?.toFixed(2) || '0.00'}
                        </span>
                        <Zap className="w-3.5 h-3.5 text-yellow-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${statusColors[user.approvalStatus]}`}>
                          {user.approvalStatus === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                          {user.approvalStatus === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                          {user.approvalStatus === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
                          {user.approvalStatus}
                        </span>
                        {user.isDisabled && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800">
                            <Ban className="w-3 h-3 mr-1" />
                            Disabled
                          </span>
                        )}
                        {user.apiAccess?.enabled && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <Key className="w-3 h-3 mr-1" />
                            API Active
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {/* View Details */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowUserModal(true);
                          }}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {/* Approve/Reject for Pending Users */}
                        {user.approvalStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveUser(user._id, 'approved')}
                              className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                              title="Approve"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproveUser(user._id, 'rejected')}
                              className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                              title="Reject"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        
                        {/* Enable/Disable */}
                        <button
                          onClick={() => handleDisableUser(user._id, !user.isDisabled)}
                          className={`p-2 ${
                            user.isDisabled 
                              ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20' 
                              : 'text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                          } rounded-lg transition-all duration-200`}
                          title={user.isDisabled ? 'Enable' : 'Disable'}
                        >
                          {user.isDisabled ? <UserCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                        </button>
                        
                        {/* API Access */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setApiSettings({
                              enabled: user.apiAccess?.enabled || false,
                              tier: user.apiAccess?.tier || 'basic',
                              rateLimit: user.apiAccess?.rateLimit || 100
                            });
                            setShowApiModal(true);
                          }}
                          className={`p-2 ${
                            user.apiAccess?.enabled 
                              ? 'text-purple-600 dark:text-purple-400' 
                              : 'text-gray-600 dark:text-gray-400'
                          } hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-all duration-200`}
                          title="API Access"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        
                        {/* Wallet */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowWalletModal(true);
                          }}
                          className="p-2 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                          title="Manage Wallet"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                        
                        {/* More Options */}
                        <div className="relative group">
                          <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                            <button
                              onClick={() => {
                                const newRole = prompt('Enter new role:', user.role);
                                if (newRole) handleRoleChange(user._id, newRole);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-xl transition-colors"
                            >
                              <Settings className="w-4 h-4 inline mr-2" />
                              Change Role
                            </button>
                            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <Activity className="w-4 h-4 inline mr-2" />
                              View Activity
                            </button>
                            <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <Mail className="w-4 h-4 inline mr-2" />
                              Send Notification
                            </button>
                            <hr className="my-1 border-gray-200 dark:border-gray-700" />
                            <button className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-xl transition-colors">
                              <Trash2 className="w-4 h-4 inline mr-2" />
                              Delete User
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> users
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination({...pagination, page: pagination.page - 1})}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPagination({...pagination, page: pageNum})}
                    className={`px-3 py-1.5 rounded-lg transition-all duration-200 ${
                      pagination.page === pageNum
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                        : 'border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => setPagination({...pagination, page: pagination.page + 1})}
                disabled={pagination.page === pagination.pages}
                className="p-2 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* API Access Modal */}
      {showApiModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    API Access Management
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {/* Current Status Card */}
              <div className={`p-4 rounded-xl mb-6 ${
                selectedUser.apiAccess?.enabled 
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800' 
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Status</span>
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                    selectedUser.apiAccess?.enabled 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                  }`}>
                    {selectedUser.apiAccess?.enabled ? (
                      <>
                        <Rocket className="w-3 h-3" />
                        Active
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3 h-3" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
                {selectedUser.apiAccess?.enabled && (
                  <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      {selectedUser.apiAccess.tier} tier
                    </span>
                    <span className="flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      {selectedUser.apiAccess.rateLimit} req/min
                    </span>
                  </div>
                )}
              </div>
              
              <div className="space-y-5">
                {/* Enable/Disable Toggle */}
                <label className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={apiSettings.enabled}
                      onChange={(e) => setApiSettings({...apiSettings, enabled: e.target.checked})}
                      className="w-5 h-5 rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-purple-600 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">Enable API Access</span>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Allow this user to access API endpoints</p>
                    </div>
                  </div>
                </label>
                
                {/* API Configuration */}
                {apiSettings.enabled && (
                  <div className="space-y-4 animate-slide-down">
                    {/* Tier Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Access Tier
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['basic', 'premium', 'enterprise'].map((tier) => (
                          <button
                            key={tier}
                            onClick={() => setApiSettings({...apiSettings, tier})}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              apiSettings.tier === tier
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                                : 'border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'
                            }`}
                          >
                            <div className="text-center">
                              {tier === 'basic' && <Shield className="w-5 h-5 mx-auto mb-1" />}
                              {tier === 'premium' && <Star className="w-5 h-5 mx-auto mb-1" />}
                              {tier === 'enterprise' && <Crown className="w-5 h-5 mx-auto mb-1" />}
                              <p className="text-xs font-medium capitalize">{tier}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Rate Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rate Limit
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={apiSettings.rateLimit}
                          onChange={(e) => setApiSettings({...apiSettings, rateLimit: parseInt(e.target.value)})}
                          min="1"
                          max="10000"
                          className="w-full px-4 py-2.5 pr-20 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
                          req/min
                        </span>
                      </div>
                    </div>
                    
                    {/* Features Info */}
                    <div className={`p-4 rounded-lg ${
                      apiSettings.tier === 'basic' ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800' :
                      apiSettings.tier === 'premium' ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800' :
                      'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800'
                    }`}>
                      <p className="text-sm font-medium mb-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        {apiSettings.tier === 'basic' && 'Basic Features'}
                        {apiSettings.tier === 'premium' && 'Premium Features'}
                        {apiSettings.tier === 'enterprise' && 'Enterprise Features'}
                      </p>
                      <ul className="space-y-1.5 text-xs">
                        {apiSettings.tier === 'basic' && (
                          <>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Read product catalog</li>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Create purchases</li>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Basic webhooks</li>
                          </>
                        )}
                        {apiSettings.tier === 'premium' && (
                          <>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> All Basic features</li>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Transaction history</li>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Wallet operations</li>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Advanced analytics</li>
                          </>
                        )}
                        {apiSettings.tier === 'enterprise' && (
                          <>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Full API access</li>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Priority support</li>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Custom endpoints</li>
                            <li className="flex items-start gap-2"><span className="text-green-500">✓</span> Dedicated resources</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
                
                {/* Warnings/Info */}
                {!apiSettings.enabled && selectedUser.apiAccess?.enabled && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      <strong className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4" />
                        Warning
                      </strong>
                      Disabling API access will deactivate all existing API keys for this user.
                    </p>
                  </div>
                )}
                
                {apiSettings.enabled && !selectedUser.apiAccess?.enabled && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <p className="text-sm text-green-800 dark:text-green-300">
                      <strong className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4" />
                        Note
                      </strong>
                      A new API key will be generated. Please save it securely as it won't be shown again.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowApiModal(false)}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleApiAccess}
                disabled={actionLoading}
                className={`px-5 py-2.5 rounded-xl text-white font-medium transition-all duration-200 flex items-center gap-2 ${
                  apiSettings.enabled 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl' 
                    : 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    {apiSettings.enabled ? <Rocket className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                    {apiSettings.enabled ? 'Enable Access' : 'Disable Access'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Wallet Modal */}
      {showWalletModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Wallet Management
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  setWalletForm({ amount: '', description: '' });
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 dark:text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-6">
              {/* Current Balance */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  GHS {selectedUser.walletBalance?.toFixed(2) || '0.00'}
                  <Zap className="w-5 h-5 text-yellow-500" />
                </p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (GHS)
                  </label>
                  <input
                    type="number"
                    value={walletForm.amount}
                    onChange={(e) => setWalletForm({...walletForm, amount: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    placeholder="Enter amount"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={walletForm.description}
                    onChange={(e) => setWalletForm({...walletForm, description: e.target.value})}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    rows="3"
                    placeholder="Enter transaction description"
                  />
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  setWalletForm({ amount: '', description: '' });
                }}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleWalletAction('debit')}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Debit
              </button>
              <button
                onClick={() => handleWalletAction('credit')}
                disabled={actionLoading}
                className="px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <Heart className="w-4 h-4" />
                )}
                Credit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slide-down {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
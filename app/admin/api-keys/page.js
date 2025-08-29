// app/admin/api-keys/page.js - API Keys Management Page
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, Search, Filter, RefreshCw, Copy, Eye, EyeOff,
  Shield, Clock, Activity, User, CheckCircle, XCircle,
  AlertCircle, Download, Trash2, Edit, MoreVertical,
  Calendar, TrendingUp, Link2, Globe, Zap, Info
} from 'lucide-react';

export default function ApiKeysManagement() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [selectedUser, setSelectedUser] = useState('');
  const [showKeyId, setShowKeyId] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedKey, setSelectedKey] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    todayRequests: 0
  });

  useEffect(() => {
    fetchApiKeys();
    fetchStats();
  }, [page, filterStatus, selectedUser]);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page,
        limit: 20,
        ...(filterStatus !== 'all' && { isActive: filterStatus === 'active' }),
        ...(selectedUser && { userId: selectedUser })
      });

      const response = await fetch(`http://localhost:5000/api/admin/api-keys?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.data.apiKeys);
        setTotalPages(data.data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/api-keys/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleToggleStatus = async (keyId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/api-keys/${keyId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });
      
      if (response.ok) {
        fetchApiKeys();
        fetchStats();
      }
    } catch (error) {
      console.error('Error toggling API key status:', error);
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    // Show toast notification
  };

  const handleShowDetails = (key) => {
    setSelectedKey(key);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400">
        <XCircle className="w-3 h-3 mr-1" />
        Inactive
      </span>
    );
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

  const formatRelativeTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return 'Recently';
  };

  const filteredKeys = apiKeys.filter(key => {
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        key.name?.toLowerCase().includes(search) ||
        key.userId?.name?.toLowerCase().includes(search) ||
        key.userId?.email?.toLowerCase().includes(search) ||
        key.key?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  if (loading && apiKeys.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">API Keys Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and monitor API key access</p>
          </div>
          <button
            onClick={fetchApiKeys}
            className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Keys</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total || apiKeys.length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Key className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Keys</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                {stats.active || apiKeys.filter(k => k.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactive Keys</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                {stats.inactive || apiKeys.filter(k => !k.isActive).length}
              </p>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Today's Requests</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                {stats.todayRequests || '0'}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or key..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          <div>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            >
              <option value="">All Users</option>
              {/* Populate with unique users from apiKeys */}
              {[...new Set(apiKeys.map(k => k.userId?.email))].filter(Boolean).map(email => (
                <option key={email} value={email}>{email}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* API Keys Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">Key Name</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">API Key</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">User</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">Created</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">Last Used</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">Usage</th>
                <th className="text-left p-4 font-medium text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.map((apiKey) => (
                <tr key={apiKey._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {apiKey.name || 'Unnamed Key'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          ID: {apiKey._id}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <code className="text-sm bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono">
                        {showKeyId === apiKey._id ? apiKey.key : `${apiKey.key.substring(0, 10)}...`}
                      </code>
                      <button
                        onClick={() => setShowKeyId(showKeyId === apiKey._id ? null : apiKey._id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        {showKeyId === apiKey._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCopyKey(apiKey.key)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {apiKey.userId?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {apiKey.userId?.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    {getStatusBadge(apiKey.isActive)}
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {formatDate(apiKey.createdAt)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {formatRelativeTime(apiKey.createdAt)}
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
                    </div>
                    {apiKey.lastUsed && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(apiKey.lastUsed)}
                      </div>
                    )}
                  </td>
                  
                  <td className="p-4">
                    <div className="flex flex-col space-y-1">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {apiKey.requestCount || 0} requests
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {apiKey.todayRequests || 0} today
                      </span>
                    </div>
                  </td>
                  
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleStatus(apiKey._id, apiKey.isActive)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          apiKey.isActive 
                            ? 'bg-green-600 dark:bg-green-700' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition ${
                          apiKey.isActive ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                      </button>
                      
                      <button
                        onClick={() => handleShowDetails(apiKey)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                        title="View Details"
                      >
                        <Info className="w-5 h-5" />
                      </button>
                      
                      <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredKeys.length === 0 && (
          <div className="p-12 text-center">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No API keys found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">API Key Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Name
                </label>
                <p className="text-gray-900 dark:text-white">{selectedKey.name || 'Unnamed Key'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  API Key
                </label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded font-mono text-sm">
                    {selectedKey.key}
                  </code>
                  <button
                    onClick={() => handleCopyKey(selectedKey.key)}
                    className="px-3 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded hover:bg-purple-700 dark:hover:bg-purple-600"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    User
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedKey.userId?.name}<br />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedKey.userId?.email}
                    </span>
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  {getStatusBadge(selectedKey.isActive)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Created
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {formatDate(selectedKey.createdAt)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Last Used
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedKey.lastUsed ? formatDate(selectedKey.lastUsed) : 'Never'}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Usage Statistics
                </label>
                <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Requests</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedKey.requestCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Today</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedKey.todayRequests || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Rate Limit</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                      {selectedKey.rateLimit || '100/min'}
                    </p>
                  </div>
                </div>
              </div>
              
              {selectedKey.permissions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Permissions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {selectedKey.permissions.map((perm, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-full text-sm">
                        {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
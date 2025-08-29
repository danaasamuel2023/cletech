// app/api-keys/page.js - API Key Management (No Tiers)
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Key, Plus, Copy, Eye, EyeOff, Trash2, RefreshCw,
  Shield, Activity, Calendar, Settings, ChevronRight,
  CheckCircle, XCircle, Info, AlertTriangle, Lock,
  Globe, Webhook, Code, Terminal, Database, Server,
  Zap, Clock, TrendingUp, BarChart, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [showKeyValue, setShowKeyValue] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // New key form data
  const [newKeyData, setNewKeyData] = useState({
    name: '',
    description: '',
    permissions: [],
    webhookUrl: '',
    ipWhitelist: ''
  });

  // Stats data
  const [selectedKeyStats, setSelectedKeyStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const permissionOptions = [
    { value: 'read:products', label: 'Read Products', icon: Database, description: 'View product catalog and pricing' },
    { value: 'write:purchases', label: 'Create Purchases', icon: Code, description: 'Make single and bulk purchases' },
    { value: 'read:transactions', label: 'Read Transactions', icon: Activity, description: 'View transaction history' },
    { value: 'read:balance', label: 'Read Balance', icon: Globe, description: 'Check wallet balance' },
    { value: 'write:transfers', label: 'Make Transfers', icon: Zap, description: 'Transfer funds between wallets' },
  ];

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile/api-keys', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setApiKeys(data.data.apiKeys);
      } else {
        setError(data.message || 'Failed to load API keys');
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      setError('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyData.name.trim()) {
      setError('Please provide a name for the API key');
      return;
    }

    setCreating(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/auth/profile/api-keys', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newKeyData,
          ipWhitelist: newKeyData.ipWhitelist ? newKeyData.ipWhitelist.split(',').map(ip => ip.trim()) : []
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('API key created successfully');
        setApiKeys([data.data, ...apiKeys]);
        setShowCreateForm(false);
        setNewKeyData({ name: '', description: '', permissions: [], webhookUrl: '', ipWhitelist: '' });
        
        // Show the new key in a modal
        setSelectedKey(data.data);
        setShowKeyValue[data.data.id] = true;
        
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      setError('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/profile/api-keys/${keyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('API key deleted successfully');
        setApiKeys(apiKeys.filter(key => key.id !== keyId));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      setError('Failed to delete API key');
    }
  };

  const handleRegenerateKey = async (keyId) => {
    if (!confirm('Are you sure you want to regenerate this API key? The old key will stop working immediately.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/profile/api-keys/${keyId}/regenerate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('API key regenerated successfully');
        setSelectedKey(data.data);
        setShowKeyValue[data.data.id] = true;
        await fetchApiKeys();
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError(data.message || 'Failed to regenerate API key');
      }
    } catch (error) {
      console.error('Error regenerating API key:', error);
      setError('Failed to regenerate API key');
    }
  };

  const fetchKeyStats = async (keyId) => {
    setLoadingStats(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/auth/profile/api-keys/${keyId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setSelectedKeyStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching key stats:', error);
    } finally {
      setLoadingStats(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
    setTimeout(() => setSuccess(''), 2000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Header Component
  const PageHeader = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-white/80">Manage your API keys and monitor usage</p>
          <div className="flex items-center space-x-4 mt-4">
            <span className="text-sm">
              {apiKeys.length} {apiKeys.length === 1 ? 'Key' : 'Keys'} Created
            </span>
          </div>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Key</span>
        </motion.button>
      </div>
    </motion.div>
  );

  // API Key Card Component
  const ApiKeyCard = ({ apiKey }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Key className="w-5 h-5 text-purple-600" />
            <span>{apiKey.name}</span>
          </h3>
          {apiKey.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{apiKey.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {apiKey.isActive ? (
            <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs rounded-full">
              Active
            </span>
          ) : (
            <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs rounded-full">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* API Key Display */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <code className="text-sm font-mono text-gray-700 dark:text-gray-300">
            {showKeyValue[apiKey.id] && apiKey.key ? apiKey.key : apiKey.keyPreview || `sk_****${(apiKey.id || apiKey._id)?.slice(-4)}`}
          </code>
          <div className="flex items-center space-x-2">
            {apiKey.key && (
              <button
                onClick={() => setShowKeyValue({ ...showKeyValue, [apiKey.id]: !showKeyValue[apiKey.id] })}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                {showKeyValue[apiKey.id] ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            )}
            <button
              onClick={() => copyToClipboard(apiKey.key || apiKey.keyPreview)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Info */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Created</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(apiKey.createdAt)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400">Last Used</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {apiKey.lastUsed ? formatDate(apiKey.lastUsed) : 'Never'}
          </p>
        </div>
      </div>

      {/* Usage Stats */}
      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-purple-600" />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {apiKey.usageStats?.totalRequests || 0} requests
          </span>
        </div>
        <button
          onClick={() => {
            setSelectedKey(apiKey);
            fetchKeyStats(apiKey.id || apiKey._id);
          }}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          View Stats
        </button>
      </div>

      {/* Permissions */}
      <div className="mb-4">
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Permissions</p>
        <div className="flex flex-wrap gap-2">
          {apiKey.permissions?.map((perm) => (
            <span
              key={perm}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-700 dark:text-gray-300"
            >
              {perm.replace(':', ': ').replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleRegenerateKey(apiKey.id || apiKey._id)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Regenerate Key"
          >
            <RefreshCw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedKey(apiKey)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </motion.button>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleDeleteKey(apiKey.id || apiKey._id)}
          className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete Key"
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </motion.button>
      </div>
    </motion.div>
  );

  // Create Key Modal
  const CreateKeyModal = () => (
    <AnimatePresence>
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowCreateForm(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New API Key</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Generate a new API key for your application
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Key Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newKeyData.name}
                  onChange={(e) => setNewKeyData({ ...newKeyData, name: e.target.value })}
                  placeholder="e.g., Production API Key"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newKeyData.description}
                  onChange={(e) => setNewKeyData({ ...newKeyData, description: e.target.value })}
                  placeholder="Optional description for this API key"
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {permissionOptions.map((permission) => (
                    <label
                      key={permission.value}
                      className="flex items-start p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={newKeyData.permissions.includes(permission.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setNewKeyData({
                              ...newKeyData,
                              permissions: [...newKeyData.permissions, permission.value]
                            });
                          } else {
                            setNewKeyData({
                              ...newKeyData,
                              permissions: newKeyData.permissions.filter(p => p !== permission.value)
                            });
                          }
                        }}
                        className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2">
                          <permission.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {permission.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {permission.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Webhook URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Webhook URL (Optional)
                </label>
                <input
                  type="url"
                  value={newKeyData.webhookUrl}
                  onChange={(e) => setNewKeyData({ ...newKeyData, webhookUrl: e.target.value })}
                  placeholder="https://your-app.com/webhook"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Receive notifications for purchase events
                </p>
              </div>

              {/* IP Whitelist */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  IP Whitelist (Optional)
                </label>
                <input
                  type="text"
                  value={newKeyData.ipWhitelist}
                  onChange={(e) => setNewKeyData({ ...newKeyData, ipWhitelist: e.target.value })}
                  placeholder="192.168.1.1, 10.0.0.1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Comma-separated list of allowed IP addresses
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowCreateForm(false)}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreateKey}
                disabled={creating || !newKeyData.name.trim()}
                className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {creating ? 'Creating...' : 'Create Key'}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Stats Modal
  const StatsModal = () => (
    <AnimatePresence>
      {selectedKeyStats && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedKeyStats(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-2xl w-full"
          >
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                API Key Statistics
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {selectedKeyStats.keyName}
              </p>
            </div>

            <div className="p-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedKeyStats.usage?.totalRequests || 0}
                  </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Successful</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedKeyStats.usage?.successfulRequests || 0}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Purchases</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedKeyStats.purchases?.totalPurchases || 0}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                  <p className="text-2xl font-bold text-blue-600">
                    GHS {selectedKeyStats.purchases?.totalAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Last Used</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedKeyStats.lastUsed ? formatDate(selectedKeyStats.lastUsed) : 'Never'}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rate Limit</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedKeyStats.rateLimit?.requests || 100} requests/minute
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    selectedKeyStats.isActive 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                  }`}>
                    {selectedKeyStats.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setSelectedKeyStats(null)}
                className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Success/Error Messages */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2"
          >
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center space-x-2"
          >
            <XCircle className="w-5 h-5" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <CreateKeyModal />
      <StatsModal />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <PageHeader />

       // Update this section in the ApiKeysPage component

{/* API Documentation Link */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4"
>
  <div className="flex items-center justify-between">
    <div className="flex items-center space-x-3">
      <Info className="w-5 h-5 text-blue-600" />
      <div>
        <p className="text-sm font-medium text-gray-900 dark:text-white">API Documentation</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">``
          Learn how to integrate our API into your application
        </p>
      </div>
    </div>
    <motion.a
      href="/api"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
    >
      View Docs
    </motion.a>
  </div>
</motion.div>

        {/* API Keys Grid */}
        {apiKeys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {apiKeys.map((key) => (
              <ApiKeyCard key={key.id || key._id} apiKey={key} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <Key className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No API Keys Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first API key to start integrating
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium"
            >
              Create Your First Key
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
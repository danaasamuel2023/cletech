// app/profile/page.js - User Profile & Account Management
'use client';

import React, { useState, useEffect } from 'react';
import { 
  User, Wallet, Shield, Calendar, Edit3, Save, X,
  Check, AlertCircle, CreditCard, Store, Key, Phone,
  Mail, Hash, Crown, Users, Briefcase, Activity,
  TrendingUp, DollarSign, Award, Settings, ChevronRight,
  Lock, Bell, Globe, Smartphone, LogOut, RefreshCw,
  Copy, Eye, EyeOff, CheckCircle, XCircle, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showApiKey, setShowApiKey] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Role display configuration
  const roleConfig = {
    admin: { label: 'Administrator', color: 'bg-red-500', icon: Crown },
    super_agent: { label: 'Super Agent', color: 'bg-purple-500', icon: Award },
    dealer: { label: 'Dealer', color: 'bg-blue-500', icon: Briefcase },
    agent: { label: 'Agent', color: 'bg-green-500', icon: Users },
    user: { label: 'Customer', color: 'bg-gray-500', icon: User }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUserData(data.data);
        setEditData({
          name: data.data.name,
          email: data.data.email,
          phoneNumber: data.data.phoneNumber,
          username: data.data.username || ''
        });
      } else {
        setError(data.message || 'Failed to load profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshBalance = async () => {
    setRefreshing(true);
    try {
      await fetchUserProfile();
      setSuccess('Balance refreshed');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to refresh balance');
    } finally {
      setRefreshing(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editData)
      });

      const data = await response.json();

      if (data.success) {
        setUserData(data.data);
        setSuccess('Profile updated successfully');
        setEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard');
    setTimeout(() => setSuccess(''), 2000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
    }
    return phone;
  };

  const StatCard = ({ icon: Icon, label, value, color, trend }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          {trend && (
            <div className="flex items-center mt-2 space-x-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-500">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
    </motion.div>
  );

  const ProfileHeader = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-xl"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Avatar */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-4 border-white/30"
          >
            <User className="w-12 h-12 text-white" />
          </motion.div>

          {/* User Info */}
          <div>
            <h1 className="text-3xl font-bold mb-2">{userData?.name}</h1>
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{userData?.email}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Phone className="w-4 h-4" />
                <span className="text-sm">{formatPhone(userData?.phoneNumber)}</span>
              </span>
            </div>
            <div className="flex items-center space-x-3 mt-3">
              {userData?.role && (
                <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm`}>
                  {React.createElement(roleConfig[userData.role].icon, { className: "w-3 h-3" })}
                  <span>{roleConfig[userData.role].label}</span>
                </span>
              )}
              {userData?.emailVerified && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 backdrop-blur-sm">
                  <CheckCircle className="w-3 h-3" />
                  <span>Verified</span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          {!editing ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setEditing(true)}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors flex items-center space-x-2"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </motion.button>
          ) : (
            <>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdateProfile}
                disabled={saving}
                className="px-4 py-2 bg-white text-purple-600 rounded-xl hover:bg-white/90 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setEditing(false);
                  setEditData({
                    name: userData.name,
                    email: userData.email,
                    phoneNumber: userData.phoneNumber,
                    username: userData.username || ''
                  });
                }}
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-colors"
              >
                <X className="w-4 h-4" />
              </motion.button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );

  const WalletSection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl p-6 border border-green-200 dark:border-green-800"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
          <Wallet className="w-5 h-5 text-green-600" />
          <span>Wallet Balance</span>
        </h3>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefreshBalance}
          disabled={refreshing}
          className="p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-4 h-4 text-green-600 ${refreshing ? 'animate-spin' : ''}`} />
        </motion.button>
      </div>
      
      <div className="space-y-4">
        <div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            GHS {userData?.walletBalance?.toFixed(2) || '0.00'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Available Balance</p>
        </div>

        {userData?.role !== 'user' && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-green-200 dark:border-green-800">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Commission</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                GHS {userData?.commission?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Earnings</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                GHS {userData?.totalEarnings?.toFixed(2) || '0.00'}
              </p>
            </div>
            {userData?.agentProfit > 0 && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">Agent Profit</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  GHS {userData?.agentProfit?.toFixed(2) || '0.00'}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2 pt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors"
          >
            Top Up
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-2 border border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl font-medium transition-colors"
          >
            Withdraw
          </motion.button>
        </div>
      </div>
    </motion.div>
  );

  const AccountDetails = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
        <Info className="w-5 h-5 text-purple-600" />
        <span>Account Information</span>
      </h3>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Full Name
          </label>
          {editing ? (
            <input
              type="text"
              value={editData.name}
              onChange={(e) => setEditData({...editData, name: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <p className="text-gray-900 dark:text-white font-medium">{userData?.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Email Address
          </label>
          {editing ? (
            <input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({...editData, email: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-gray-900 dark:text-white font-medium">{userData?.email}</p>
              {userData?.emailVerified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Phone Number
          </label>
          {editing ? (
            <input
              type="tel"
              value={editData.phoneNumber}
              onChange={(e) => setEditData({...editData, phoneNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-gray-900 dark:text-white font-medium">{formatPhone(userData?.phoneNumber)}</p>
              {userData?.phoneVerified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
          )}
        </div>

        {/* Username */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Username
          </label>
          {editing ? (
            <input
              type="text"
              value={editData.username}
              onChange={(e) => setEditData({...editData, username: e.target.value})}
              placeholder="Set a username"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          ) : (
            <p className="text-gray-900 dark:text-white font-medium">
              {userData?.username || <span className="text-gray-400">Not set</span>}
            </p>
          )}
        </div>

        {/* Account ID */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Account ID
          </label>
          <div className="flex items-center space-x-2">
            <p className="text-gray-900 dark:text-white font-mono text-sm">{userData?._id}</p>
            <button
              onClick={() => copyToClipboard(userData?._id)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Date Joined */}
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Member Since
          </label>
          <p className="text-gray-900 dark:text-white font-medium">
            {userData?.createdAt && formatDate(userData.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );

  const ApiAccessSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
        <Key className="w-5 h-5 text-purple-600" />
        <span>API Access</span>
      </h3>

      {userData?.apiAccess?.enabled ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">API Access Enabled</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Tier: {userData.apiAccess.tier} • {userData.apiAccess.rateLimit} requests/min
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium"
            >
              Manage Keys
            </motion.button>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">API Endpoint</p>
            <div className="flex items-center space-x-2">
              <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 text-xs">
                https://api.yourdomain.com/v1
              </code>
              <button
                onClick={() => copyToClipboard('https://api.yourdomain.com/v1')}
                className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Key className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">API access not enabled</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
          >
            Request API Access
          </motion.button>
        </div>
      )}
    </div>
  );

  const StoreSection = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center space-x-2">
        <Store className="w-5 h-5 text-purple-600" />
        <span>Agent Store</span>
      </h3>

      {userData?.hasStore ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-purple-600" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Store Active</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Your store is live and accepting orders
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm font-medium"
            >
              Manage Store
            </motion.button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Sales</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">GHS 245.00</p>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">127</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Store className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {userData?.role === 'agent' || userData?.role === 'super_agent' 
              ? 'You don\'t have a store yet' 
              : 'Become an agent to create a store'}
          </p>
          {(userData?.role === 'agent' || userData?.role === 'super_agent') && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors"
            >
              Create Store
            </motion.button>
          )}
        </div>
      )}
    </div>
  );

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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <ProfileHeader />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          <StatCard 
            icon={Wallet}
            label="Wallet Balance"
            value={`GHS ${userData?.walletBalance?.toFixed(2) || '0.00'}`}
            color="bg-green-500"
          />
          <StatCard 
            icon={Shield}
            label="Account Role"
            value={roleConfig[userData?.role]?.label || 'User'}
            color={roleConfig[userData?.role]?.color || 'bg-gray-500'}
          />
          <StatCard 
            icon={Calendar}
            label="Days Active"
            value={userData?.createdAt ? Math.floor((new Date() - new Date(userData.createdAt)) / (1000 * 60 * 60 * 24)) : 0}
            color="bg-blue-500"
          />
          <StatCard 
            icon={Activity}
            label="Account Status"
            value={userData?.approvalStatus === 'approved' ? 'Active' : userData?.approvalStatus || 'Pending'}
            color="bg-purple-500"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column - Account Details */}
          <div className="lg:col-span-2 space-y-6">
            <AccountDetails />
            
            {/* Additional Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ApiAccessSection />
              <StoreSection />
            </div>
          </div>

          {/* Right Column - Wallet & Quick Actions */}
          <div className="space-y-6">
            <WalletSection />

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">Change Password</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">Notifications</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-900 dark:text-white">Settings</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
                <button className="w-full p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-between text-red-600">
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
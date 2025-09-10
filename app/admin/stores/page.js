// app/admin/stores/page.js - Agent Stores Management with Dark Mode
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, Search, Filter, Eye, CheckCircle, XCircle, 
  Clock, Star, TrendingUp, DollarSign, Users, Package,
  Globe, Phone, Mail, Calendar, Shield, Award, BarChart3,
  AlertCircle, Settings, ExternalLink, MessageSquare, MapPin,
  Wifi, WifiOff, Edit, MoreVertical, Download, Upload, ShoppingCart
} from 'lucide-react';
import AdminLayout from '../layout';
import Link from 'next/link';

export default function StoresManagement() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [filters, setFilters] = useState({
    search: '',
    verificationStatus: '',
    isActive: '',
    isPremium: '',
    page: 1,
    limit: 20
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    verified: 0,
    premium: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchStores();
    fetchStats();
  }, [filters]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const response = await fetch(`https://api.cletech.shop/api/admin/stores?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStores(data.data.stores);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      // Mock data for demonstration
      const mockStores = [
        {
          _id: '1',
          agent: { 
            _id: 'agent1',
            name: 'John Doe', 
            email: 'john@example.com', 
            phoneNumber: '0241234567' 
          },
          storeName: 'JD Data Hub',
          subdomain: 'jdhub',
          logo: null,
          bannerImage: null,
          whatsappNumber: '0241234567',
          contactEmail: 'store@jdhub.com',
          description: 'Your reliable data partner',
          verificationStatus: 'verified',
          isActive: true,
          isPremium: true,
          operatingStatus: { isOpen: true },
          statistics: {
            totalSales: 234,
            totalRevenue: 5678.50,
            totalProfit: 890.25,
            totalCustomers: 156,
            rating: 4.8,
            reviewCount: 45
          },
          customPricing: [
            { network: 'MTN', capacity: 1, agentPrice: 6, systemPrice: 5, profit: 1, isActive: true },
            { network: 'MTN', capacity: 2, agentPrice: 12, systemPrice: 10, profit: 2, isActive: true }
          ],
          createdAt: new Date('2024-01-15'),
          verifiedAt: new Date('2024-01-16')
        },
        {
          _id: '2',
          agent: { 
            _id: 'agent2',
            name: 'Jane Smith', 
            email: 'jane@example.com', 
            phoneNumber: '0501234567' 
          },
          storeName: 'Quick Data Store',
          subdomain: 'quickdata',
          logo: null,
          bannerImage: null,
          whatsappNumber: '0501234567',
          contactEmail: 'info@quickdata.com',
          description: 'Fast and reliable data services',
          verificationStatus: 'pending',
          isActive: true,
          isPremium: false,
          operatingStatus: { isOpen: true },
          statistics: {
            totalSales: 123,
            totalRevenue: 2345.00,
            totalProfit: 345.50,
            totalCustomers: 89,
            rating: 4.5,
            reviewCount: 23
          },
          customPricing: [
            { network: 'TELECEL', capacity: 5, agentPrice: 26, systemPrice: 24, profit: 2, isActive: true }
          ],
          createdAt: new Date('2024-02-01'),
          verifiedAt: null
        },
        {
          _id: '3',
          agent: { 
            _id: 'agent3',
            name: 'Bob Johnson', 
            email: 'bob@example.com', 
            phoneNumber: '0271234567' 
          },
          storeName: 'Data Express',
          subdomain: 'dataexpress',
          logo: null,
          bannerImage: null,
          whatsappNumber: '0271234567',
          contactEmail: 'sales@dataexpress.com',
          description: 'Express data delivery',
          verificationStatus: 'rejected',
          isActive: false,
          isPremium: false,
          operatingStatus: { isOpen: false, closedReason: 'Under maintenance' },
          statistics: {
            totalSales: 45,
            totalRevenue: 890.00,
            totalProfit: 120.75,
            totalCustomers: 34,
            rating: 3.8,
            reviewCount: 12
          },
          customPricing: [],
          createdAt: new Date('2024-02-10'),
          verifiedAt: null
        }
      ];
      setStores(mockStores);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Mock stats
    setStats({
      total: 156,
      active: 142,
      pending: 8,
      verified: 134,
      premium: 23,
      totalRevenue: 456789.50
    });
  };

  const handleVerifyStore = async (storeId, status, reason) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.cletech.shop/api/admin/stores/${storeId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, reason })
      });
      
      if (response.ok) {
        fetchStores();
        setShowVerifyModal(false);
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Error verifying store:', error);
    }
  };

  const handleTogglePremium = async (storeId, isPremium) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.cletech.shop/api/admin/stores/${storeId}/premium`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPremium })
      });
      
      if (response.ok) {
        fetchStores();
      }
    } catch (error) {
      console.error('Error updating premium status:', error);
    }
  };

  const getVerificationBadge = (status) => {
    const badges = {
      verified: { icon: CheckCircle, color: 'text-green-500 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', text: 'Verified' },
      pending: { icon: Clock, color: 'text-yellow-500 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'Pending' },
      rejected: { icon: XCircle, color: 'text-red-500 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', text: 'Rejected' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}>
        <Icon className={`w-3 h-3 mr-1 ${badge.color}`} />
        <span className={badge.color.replace('text-', 'text-').split(' ')[0].replace('text-', 'text-').replace('-500', '-800').replace('-400', '-300')}>{badge.text}</span>
      </span>
    );
  };

  const StoreDetailsModal = () => {
    if (!selectedStore) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Store Details</h2>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Store Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-700 dark:to-indigo-700 rounded-xl p-6 text-white mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {selectedStore.logo ? (
                  <img src={selectedStore.logo} alt="Logo" className="w-16 h-16 rounded-lg bg-white dark:bg-gray-800 p-1" />
                ) : (
                  <div className="w-16 h-16 bg-white bg-opacity-20 dark:bg-gray-800 dark:bg-opacity-30 rounded-lg flex items-center justify-center">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold">{selectedStore.storeName}</h3>
                  <p className="text-purple-100 dark:text-purple-200">@{selectedStore.subdomain}</p>
                  <div className="flex items-center space-x-3 mt-2">
                    {getVerificationBadge(selectedStore.verificationStatus)}
                    {selectedStore.isPremium && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                        <Award className="w-3 h-3 mr-1" />
                        Premium
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedStore.isActive 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                        : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                    }`}>
                      {selectedStore.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_BASE_URL}/${selectedStore.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white bg-opacity-20 dark:bg-gray-800 dark:bg-opacity-30 rounded-lg hover:bg-opacity-30 dark:hover:bg-opacity-40 transition-colors"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {['overview', 'agent', 'products', 'analytics', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Total Sales</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStore.statistics.totalSales}</p>
                      </div>
                      <ShoppingCart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">GHS {selectedStore.statistics.totalRevenue.toFixed(2)}</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Profit</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">GHS {selectedStore.statistics.totalProfit.toFixed(2)}</p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Customers</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStore.statistics.totalCustomers}</p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Store Info */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Store Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Operating Status</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center">
                        {selectedStore.operatingStatus.isOpen ? (
                          <>
                            <Wifi className="w-4 h-4 text-green-500 dark:text-green-400 mr-1" />
                            Open
                          </>
                        ) : (
                          <>
                            <WifiOff className="w-4 h-4 text-red-500 dark:text-red-400 mr-1" />
                            Closed
                          </>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Rating</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mr-1" />
                        {selectedStore.statistics.rating} ({selectedStore.statistics.reviewCount} reviews)
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">{new Date(selectedStore.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Verified Date</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedStore.verifiedAt ? new Date(selectedStore.verifiedAt).toLocaleDateString() : 'Not verified'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {selectedStore.description && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
                    <p className="text-gray-600 dark:text-gray-300">{selectedStore.description}</p>
                  </div>
                )}
              </>
            )}

            {activeTab === 'agent' && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Agent Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedStore.agent.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center">
                        <Mail className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                        {selectedStore.agent.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center">
                        <Phone className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                        {selectedStore.agent.phoneNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">WhatsApp</p>
                      <p className="font-medium text-gray-900 dark:text-white flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />
                        {selectedStore.whatsappNumber}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Store Email:</span> 
                      <span className="text-gray-900 dark:text-white ml-2">{selectedStore.contactEmail}</span>
                    </p>
                    {selectedStore.location && (
                      <p className="text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Location:</span> 
                        <span className="text-gray-900 dark:text-white ml-2">{selectedStore.location}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'products' && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 dark:text-white">Custom Pricing ({selectedStore.customPricing.length} products)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Network</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Capacity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">System Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Agent Price</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Profit</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {selectedStore.customPricing.map((pricing, index) => (
                        <tr key={index} className="bg-white dark:bg-gray-800">
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{pricing.network}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{pricing.capacity}GB</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">GHS {pricing.systemPrice}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white">GHS {pricing.agentPrice}</td>
                          <td className="px-4 py-2 text-sm text-green-600 dark:text-green-400">+GHS {pricing.profit}</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              pricing.isActive 
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                            }`}>
                              {pricing.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Performance Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Average Order Value</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        GHS {(selectedStore.statistics.totalRevenue / selectedStore.statistics.totalSales).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Profit Margin</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {((selectedStore.statistics.totalProfit / selectedStore.statistics.totalRevenue) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Customer Retention</span>
                      <span className="font-medium text-gray-900 dark:text-white">78%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Premium Status</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Grant premium features to this store</p>
                  </div>
                  <button
                    onClick={() => handleTogglePremium(selectedStore._id, !selectedStore.isPremium)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      selectedStore.isPremium ? 'bg-purple-600 dark:bg-purple-700' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition ${
                      selectedStore.isPremium ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            {selectedStore.verificationStatus === 'pending' && (
              <>
                <button
                  onClick={() => setShowVerifyModal(true)}
                  className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
                >
                  Verify Store
                </button>
                <button
                  onClick={() => handleVerifyStore(selectedStore._id, 'rejected', 'Does not meet requirements')}
                  className="flex-1 px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors"
                >
                  Reject Store
                </button>
              </>
            )}
            <Link
              href={`/admin/stores/${selectedStore._id}/analytics`}
              className="flex-1 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors text-center"
            >
              View Full Analytics
            </Link>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    // <AdminLayout>
      <div className="p-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Agent Stores</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Manage and monitor all agent stores</p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
              <Link
                href="/admin/stores/analytics"
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
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Stores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <Store className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.active}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.verified}</p>
              </div>
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Premium</p>
                <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{stats.premium}</p>
              </div>
              <Award className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">GHS {stats.totalRevenue.toFixed(0)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                />
              </div>
            </div>

            <select
              value={filters.verificationStatus}
              onChange={(e) => setFilters({...filters, verificationStatus: e.target.value})}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            >
              <option value="">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.isActive}
              onChange={(e) => setFilters({...filters, isActive: e.target.value})}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            >
              <option value="">All Stores</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <select
              value={filters.isPremium}
              onChange={(e) => setFilters({...filters, isPremium: e.target.value})}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            >
              <option value="">All Types</option>
              <option value="true">Premium</option>
              <option value="false">Regular</option>
            </select>
          </div>
        </div>

        {/* Stores Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Store
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Agent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
                      </div>
                    </td>
                  </tr>
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No stores found
                    </td>
                  </tr>
                ) : (
                  stores.map((store) => (
                    <tr key={store._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                            <Store className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{store.storeName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">@{store.subdomain}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">{store.agent.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{store.agent.phoneNumber}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getVerificationBadge(store.verificationStatus)}
                          {store.isPremium && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                              <Award className="w-3 h-3 mr-1" />
                              Premium
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            store.operatingStatus.isOpen 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                          }`}>
                            {store.operatingStatus.isOpen ? 'Open' : 'Closed'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm text-gray-900 dark:text-white">{store.statistics.totalSales} sales</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{store.statistics.totalCustomers} customers</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            GHS {store.statistics.totalRevenue.toFixed(2)}
                          </div>
                          <div className="text-sm text-green-600 dark:text-green-400">
                            +{store.statistics.totalProfit.toFixed(2)} profit
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 dark:text-yellow-400 mr-1" />
                          <span className="text-sm text-gray-900 dark:text-white">{store.statistics.rating}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">({store.statistics.reviewCount})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedStore(store);
                              setShowDetailsModal(true);
                            }}
                            className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <a
                            href={`${process.env.NEXT_PUBLIC_BASE_URL}/${store.subdomain}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <ExternalLink className="w-5 h-5" />
                          </a>
                          <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                            <MoreVertical className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modals */}
        {showDetailsModal && <StoreDetailsModal />}
      </div>
    // {/* </AdminLayout> */}
  );
}
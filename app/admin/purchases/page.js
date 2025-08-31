// app/admin/purchases/page.js - Complete with truncated references
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, Search, Filter, Eye, CheckCircle,
  XCircle, Clock, RefreshCw, DollarSign, User,
  Phone, Calendar, Package, AlertCircle, Download,
  TrendingUp, CreditCard, ArrowRight, MoreVertical,
  CheckSquare, Square, Edit2, Copy
} from 'lucide-react';

export default function PurchasesManagement() {
  const router = useRouter();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
  const [selectedPurchases, setSelectedPurchases] = useState([]);
  const [bulkStatus, setBulkStatus] = useState('');
  const [bulkAdminNotes, setBulkAdminNotes] = useState('');
  const [copiedRef, setCopiedRef] = useState(null);
  const [filters, setFilters] = useState({
    status: '',
    network: '',
    method: '',
    startDate: '',
    endDate: '',
    search: '',
    page: 1,
    limit: 50
  });
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    fetchPurchases();
    fetchStats();
  }, [filters]);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const response = await fetch(`https://cletech-server.onrender.com/api/admin/purchases?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPurchases(data.data.purchases);
        setSelectedPurchases([]);
      } else {
        console.error('Failed to fetch purchases');
      }
    } catch (error) {
      console.error('Error fetching purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/analytics/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const purchaseStats = data.data.purchases;
        if (purchaseStats) {
          setStats({
            total: purchaseStats.todayPurchases?.[0]?.count || 0,
            completed: purchaseStats.byStatus?.find(s => s._id === 'completed')?.count || 0,
            pending: purchaseStats.byStatus?.find(s => s._id === 'pending')?.count || 0,
            failed: purchaseStats.byStatus?.find(s => s._id === 'failed')?.count || 0,
            totalRevenue: purchaseStats.byNetwork?.reduce((sum, n) => sum + n.revenue, 0) || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCopyReference = (reference) => {
    navigator.clipboard.writeText(reference);
    setCopiedRef(reference);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const handleSingleStatusUpdate = async (purchaseId, newStatus, adminNotes = '') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://cletech-server.onrender.com/api/admin/purchases/${purchaseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: newStatus,
          adminNotes: adminNotes 
        })
      });
      
      if (response.ok) {
        fetchPurchases();
        setShowDetailsModal(false);
        alert('Purchase status updated successfully');
      }
    } catch (error) {
      console.error('Error updating purchase:', error);
      alert('Failed to update purchase status');
    }
  };

  const handleBulkStatusUpdate = async () => {
    if (!bulkStatus) {
      alert('Please select a status');
      return;
    }

    if (selectedPurchases.length === 0) {
      alert('No purchases selected');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://cletech-server.onrender.com/api/admin/purchases/bulk-status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          purchaseIds: selectedPurchases,
          status: bulkStatus,
          adminNotes: bulkAdminNotes
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        alert(`Bulk update completed. ${data.data.successful.length} successful, ${data.data.failed.length} failed`);
        fetchPurchases();
        setShowBulkUpdateModal(false);
        setSelectedPurchases([]);
        setBulkStatus('');
        setBulkAdminNotes('');
      }
    } catch (error) {
      console.error('Error bulk updating purchases:', error);
      alert('Failed to bulk update purchases');
    }
  };

  const togglePurchaseSelection = (purchaseId) => {
    setSelectedPurchases(prev => {
      if (prev.includes(purchaseId)) {
        return prev.filter(id => id !== purchaseId);
      }
      return [...prev, purchaseId];
    });
  };

  const selectAllPurchases = () => {
    if (selectedPurchases.length === purchases.length) {
      setSelectedPurchases([]);
    } else {
      setSelectedPurchases(purchases.map(p => p._id));
    }
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
      processing: { 
        icon: RefreshCw, 
        color: 'text-blue-500 dark:text-blue-400', 
        bg: 'bg-blue-100 dark:bg-blue-900/30' 
      },
      refunded: { 
        icon: RefreshCw, 
        color: 'text-purple-500 dark:text-purple-400', 
        bg: 'bg-purple-100 dark:bg-purple-900/30' 
      },
      delivered: {
        icon: Package,
        color: 'text-indigo-500 dark:text-indigo-400',
        bg: 'bg-indigo-100 dark:bg-indigo-900/30'
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

  const getNetworkBadge = (network) => {
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

  const BulkUpdateModal = () => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Bulk Update Status
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Update status for {selectedPurchases.length} selected purchase(s)
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Status
              </label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={bulkAdminNotes}
                onChange={(e) => setBulkAdminNotes(e.target.value)}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add notes for this bulk update..."
              />
            </div>

            {bulkStatus === 'refunded' && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Warning: This will refund all selected purchases and credit users' wallets.
                </p>
              </div>
            )}

            <div className="flex space-x-3 pt-4">
              <button
                onClick={handleBulkStatusUpdate}
                className="flex-1 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
              >
                Update Status
              </button>
              <button
                onClick={() => {
                  setShowBulkUpdateModal(false);
                  setBulkStatus('');
                  setBulkAdminNotes('');
                }}
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

  const PurchaseDetailsModal = () => {
    if (!selectedPurchase) return null;
    
    const [editStatus, setEditStatus] = useState(selectedPurchase.status);
    const [adminNotes, setAdminNotes] = useState('');

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Purchase Details</h2>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Purchase Header */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Reference</p>
                  <div className="flex items-center space-x-2">
                    <p className="font-mono text-lg font-semibold text-gray-900 dark:text-white">
                      {selectedPurchase.reference}
                    </p>
                    <button
                      onClick={() => handleCopyReference(selectedPurchase.reference)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                      title="Copy reference"
                    >
                      <Copy className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    </button>
                  </div>
                </div>
                <div>{getStatusBadge(selectedPurchase.status)}</div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedPurchase.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    GHS {selectedPurchase.price}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Update Section - SINGLE UPDATE */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                <Edit2 className="w-4 h-4 mr-2" />
                Update Order Status
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="delivered">Delivered</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Notes
                  </label>
                  <input
                    type="text"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Optional notes..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              <button
                onClick={() => handleSingleStatusUpdate(selectedPurchase._id, editStatus, adminNotes)}
                className="mt-3 w-full px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
              >
                Update Status
              </button>
            </div>

            {/* Customer Information */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Customer Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedPurchase.userId?.name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedPurchase.userId?.email}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedPurchase.userId?.phoneNumber}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Recipient Phone</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedPurchase.phoneNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  router.push(`/admin/user/${selectedPurchase.userId?._id}/purchases`);
                }}
                className="mt-4 w-full px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
              >
                <User className="w-4 h-4" />
                <span>View All Purchases by This User</span>
              </button>
            </div>

            {/* Purchase Details */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                Purchase Details
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Network</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    getNetworkBadge(selectedPurchase.network)
                  }`}>
                    {selectedPurchase.network}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Data Size</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedPurchase.capacity}GB
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Payment Method</p>
                  <p className="font-medium capitalize text-gray-900 dark:text-white">
                    {selectedPurchase.method}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gateway</p>
                  <p className="font-medium capitalize text-gray-900 dark:text-white">
                    {selectedPurchase.gateway}
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Purchases Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Track and manage all data purchases</p>
          </div>
          <div className="flex space-x-2">
            {selectedPurchases.length > 0 && (
              <button 
                onClick={() => setShowBulkUpdateModal(true)}
                className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2"
              >
                <Edit2 className="w-5 h-5" />
                <span>Bulk Update ({selectedPurchases.length})</span>
              </button>
            )}
            <button className="px-4 py-2 bg-gray-600 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Export Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed}</p>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Failed</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.failed}</p>
            </div>
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                GHS {stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by reference or phone..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>
          </div>

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
            <option value="refunded">Refunded</option>
          </select>

          <select
            value={filters.network}
            onChange={(e) => setFilters({...filters, network: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
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
            value={filters.method}
            onChange={(e) => setFilters({...filters, method: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          >
            <option value="">All Methods</option>
            <option value="wallet">Wallet</option>
            <option value="momo">Mobile Money</option>
            <option value="card">Card</option>
            <option value="admin">Admin</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({...filters, startDate: e.target.value})}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            placeholder="Start Date"
          />
        </div>
      </div>

      {/* Purchases Table with Checkboxes */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={selectAllPurchases}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  >
                    {selectedPurchases.length === purchases.length && purchases.length > 0 ? 
                      <CheckSquare className="w-5 h-5" /> : 
                      <Square className="w-5 h-5" />
                    }
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ref
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
                    </div>
                  </td>
                </tr>
              ) : purchases.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No purchases found
                  </td>
                </tr>
              ) : (
                purchases.map((purchase) => (
                  <tr key={purchase._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => togglePurchaseSelection(purchase._id)}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                      >
                        {selectedPurchases.includes(purchase._id) ? 
                          <CheckSquare className="w-5 h-5 text-purple-600" /> : 
                          <Square className="w-5 h-5" />
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-1">
                        <span className="text-sm font-mono font-bold text-purple-600 dark:text-purple-400">
                          #{purchase.reference.slice(-4)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyReference(purchase.reference);
                          }}
                          className="relative p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                          title={`Full: ${purchase.reference}`}
                        >
                          {copiedRef === purchase.reference ? (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {purchase.userId?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {purchase.phoneNumber}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          getNetworkBadge(purchase.network)
                        }`}>
                          {purchase.network}
                        </span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {purchase.capacity}GB
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">
                        GHS {purchase.price}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white capitalize">
                          {purchase.method}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {purchase.gateway}
                        </p>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedPurchase(purchase);
                            setShowDetailsModal(true);
                          }}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                          title="View Details & Edit"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {purchase.userId?._id && (
                          <button
                            onClick={() => router.push(`/admin/users/${purchase.userId._id}/purchases`)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="View All User Purchases"
                          >
                            <User className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Copy Notification */}
      {copiedRef && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in">
          Reference copied!
        </div>
      )}

      {/* Modals */}
      {showDetailsModal && <PurchaseDetailsModal />}
      {showBulkUpdateModal && <BulkUpdateModal />}
    </div>
  );
}
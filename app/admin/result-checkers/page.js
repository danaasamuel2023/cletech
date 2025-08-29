// app/admin/result-checkers/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Upload, Download, Search, Filter, Eye, 
  Plus, Calendar, DollarSign, Package, AlertCircle,
  FileText, Clock, CheckCircle, XCircle, TrendingUp,
  Users, BarChart3, Trash2, Edit, Copy, FileSpreadsheet,
  Info, Shield, Hash, Key, Archive, RefreshCw, ChevronRight
} from 'lucide-react';
import AdminLayout from '../layout';

export default function ResultCheckersManagement() {
  const [checkers, setCheckers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [selectedChecker, setSelectedChecker] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  
  const [filters, setFilters] = useState({
    type: '',
    year: '',
    status: '',
    search: '',
    page: 1,
    limit: 50
  });

  const [stats, setStats] = useState({
    total: 0,
    available: 0,
    sold: 0,
    expired: 0,
    totalValue: 0,
    totalRevenue: 0
  });

  const [uploadData, setUploadData] = useState({
    type: 'WASSCE',
    year: new Date().getFullYear(),
    examType: 'MAY/JUNE',
    price: 10,
    cards: []
  });

  const [bulkInput, setBulkInput] = useState('');

  useEffect(() => {
    fetchCheckers();
    fetchStats();
  }, [filters]);

  const fetchCheckers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const queryParams = new URLSearchParams(
        Object.entries(filters).filter(([_, v]) => v !== '')
      );
      
      const response = await fetch(`/api/admin/result-checkers?${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCheckers(data.data.checkers);
      }
    } catch (error) {
      console.error('Error fetching checkers:', error);
      // Mock data for demonstration
      const mockCheckers = [
        {
          _id: '1',
          type: 'WASSCE',
          year: 2024,
          examType: 'MAY/JUNE',
          serialNumber: 'WAS24001234',
          pin: 'ABC123XYZ456',
          price: 10,
          status: 'available',
          batchInfo: {
            batchNumber: 'BATCH-1704150000000',
            batchDate: new Date('2024-01-01'),
            totalInBatch: 100
          },
          addedBy: { name: 'Admin User' },
          createdAt: new Date('2024-01-01')
        },
        {
          _id: '2',
          type: 'BECE',
          year: 2024,
          examType: 'JUNE',
          serialNumber: 'BEC24005678',
          pin: 'DEF456UVW789',
          price: 8,
          status: 'sold',
          soldTo: {
            user: { name: 'John Doe', email: 'john@example.com' },
            soldAt: new Date('2024-02-15'),
            purchasePrice: 8
          },
          batchInfo: {
            batchNumber: 'BATCH-1704150000000',
            batchDate: new Date('2024-01-01'),
            totalInBatch: 100
          },
          addedBy: { name: 'Admin User' },
          createdAt: new Date('2024-01-01')
        },
        {
          _id: '3',
          type: 'WASSCE',
          year: 2024,
          examType: 'NOV/DEC',
          serialNumber: 'WAS24009012',
          pin: 'GHI789RST012',
          price: 10,
          status: 'used',
          usedBy: {
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            usedAt: new Date('2024-03-01')
          },
          soldTo: {
            user: { name: 'Jane Smith', email: 'jane@example.com' },
            soldAt: new Date('2024-02-20'),
            purchasePrice: 10
          },
          batchInfo: {
            batchNumber: 'BATCH-1704236400000',
            batchDate: new Date('2024-01-02'),
            totalInBatch: 50
          },
          addedBy: { name: 'Admin User' },
          createdAt: new Date('2024-01-02')
        }
      ];
      setCheckers(mockCheckers);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    // Mock stats
    setStats({
      total: 1250,
      available: 850,
      sold: 300,
      expired: 50,
      used: 50,
      totalValue: 12500,
      totalRevenue: 3000
    });
  };

  const handleBulkUpload = async () => {
    // Parse bulk input
    const lines = bulkInput.trim().split('\n');
    const cards = lines.map(line => {
      const [serialNumber, pin] = line.split(/[\s,\t]+/);
      return { serialNumber: serialNumber?.trim(), pin: pin?.trim() };
    }).filter(card => card.serialNumber && card.pin);

    if (cards.length === 0) {
      alert('No valid cards found. Please check your input format.');
      return;
    }

    const uploadPayload = {
      ...uploadData,
      cards
    };

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/admin/result-checkers/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadPayload)
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully added ${result.data.summary.successful} cards. ${result.data.summary.failed} failed.`);
        setShowBulkUploadModal(false);
        setBulkInput('');
        fetchCheckers();
        fetchStats();
      }
    } catch (error) {
      console.error('Error uploading cards:', error);
      alert('Failed to upload cards. Please try again.');
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setBulkInput(text);
    };
    reader.readAsText(file);
  };

  const getStatusBadge = (status) => {
    const badges = {
      available: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', text: 'Available' },
      sold: { icon: DollarSign, color: 'text-blue-500', bg: 'bg-blue-100', text: 'Sold' },
      used: { icon: CheckCircle, color: 'text-purple-500', bg: 'bg-purple-100', text: 'Used' },
      expired: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-100', text: 'Expired' }
    };
    const badge = badges[status] || badges.available;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg}`}>
        <Icon className={`w-3 h-3 mr-1 ${badge.color}`} />
        {badge.text}
      </span>
    );
  };

  const BulkUploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Bulk Upload Result Checkers</h2>
          <button
            onClick={() => setShowBulkUploadModal(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Settings */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
            <select
              value={uploadData.type}
              onChange={(e) => setUploadData({...uploadData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="WASSCE">WASSCE</option>
              <option value="BECE">BECE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
            <input
              type="number"
              value={uploadData.year}
              onChange={(e) => setUploadData({...uploadData, year: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="2020"
              max="2030"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Exam Period</label>
            <select
              value={uploadData.examType}
              onChange={(e) => setUploadData({...uploadData, examType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="MAY/JUNE">MAY/JUNE</option>
              <option value="NOV/DEC">NOV/DEC</option>
              <option value="JUNE">JUNE</option>
              <option value="PRIVATE">PRIVATE</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (GHS)</label>
            <input
              type="number"
              value={uploadData.price}
              onChange={(e) => setUploadData({...uploadData, price: parseFloat(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="0"
              step="0.5"
            />
          </div>
        </div>

        {/* Upload Methods */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">Card Details</label>
            <div className="flex space-x-2">
              <label className="px-3 py-1 bg-gray-100 text-sm rounded-lg hover:bg-gray-200 cursor-pointer flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>Upload CSV/TXT</span>
                <input
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                onClick={() => {
                  const template = 'WAS24001234,ABC123XYZ456\nWAS24001235,DEF456UVW789\nWAS24001236,GHI789RST012';
                  setBulkInput(template);
                }}
                className="px-3 py-1 bg-gray-100 text-sm rounded-lg hover:bg-gray-200 flex items-center space-x-2"
              >
                <FileText className="w-4 h-4" />
                <span>Load Template</span>
              </button>
            </div>
          </div>

          <textarea
            value={bulkInput}
            onChange={(e) => setBulkInput(e.target.value)}
            placeholder="Enter cards (one per line): SERIAL_NUMBER,PIN
Example:
WAS24001234,ABC123XYZ456
WAS24001235,DEF456UVW789"
            className="w-full h-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono text-sm"
          />

          <div className="mt-2 flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Format: SERIAL_NUMBER,PIN (comma, tab, or space separated). 
              {bulkInput && ` ${bulkInput.trim().split('\n').filter(l => l.trim()).length} cards detected.`}
            </p>
          </div>
        </div>

        {/* Preview */}
        {bulkInput && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview (First 3 cards)</h4>
            <div className="space-y-1">
              {bulkInput.trim().split('\n').slice(0, 3).map((line, index) => {
                const [serial, pin] = line.split(/[\s,\t]+/);
                return (
                  <div key={index} className="text-sm font-mono">
                    <span className="text-gray-500">{index + 1}.</span> 
                    <span className="text-blue-600 ml-2">{serial}</span> 
                    <ChevronRight className="w-3 h-3 inline mx-1 text-gray-400" />
                    <span className="text-green-600">{pin}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={handleBulkUpload}
            disabled={!bulkInput.trim()}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 ${
              bulkInput.trim() 
                ? 'bg-purple-600 text-white hover:bg-purple-700' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span>Upload Cards</span>
          </button>
          <button
            onClick={() => setShowBulkUploadModal(false)}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  const CheckerDetailsModal = () => {
    if (!selectedChecker) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Card Details</h2>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Card Info */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-purple-100 text-sm">Serial Number</p>
                  <p className="text-2xl font-bold font-mono">{selectedChecker.serialNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-purple-100 text-sm">PIN</p>
                  <p className="text-xl font-bold font-mono">{selectedChecker.pin}</p>
                </div>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div>
                  <p className="text-purple-100 text-sm">{selectedChecker.type} • {selectedChecker.year}</p>
                  <p className="text-white font-medium">{selectedChecker.examType}</p>
                </div>
                {getStatusBadge(selectedChecker.status)}
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Price</p>
                <p className="font-semibold text-gray-900">GHS {selectedChecker.price}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Batch Number</p>
                <p className="font-semibold text-gray-900">{selectedChecker.batchInfo.batchNumber}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Added By</p>
                <p className="font-semibold text-gray-900">{selectedChecker.addedBy.name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500">Added Date</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedChecker.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Transaction History */}
            {(selectedChecker.soldTo || selectedChecker.usedBy) && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-3">Transaction History</h4>
                <div className="space-y-2">
                  {selectedChecker.soldTo && (
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Sold to {selectedChecker.soldTo.user.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedChecker.soldTo.soldAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <p className="font-semibold">GHS {selectedChecker.soldTo.purchasePrice}</p>
                    </div>
                  )}
                  {selectedChecker.usedBy && (
                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm font-medium">Used by {selectedChecker.usedBy.user.name}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(selectedChecker.usedBy.usedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${selectedChecker.serialNumber},${selectedChecker.pin}`);
                alert('Card details copied to clipboard');
              }}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Copy className="w-5 h-5" />
              <span>Copy Details</span>
            </button>
            <button
              onClick={() => setShowDetailsModal(false)}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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
              <h1 className="text-3xl font-bold text-gray-900">Result Checkers</h1>
              <p className="text-gray-600 mt-2">Manage WASSCE and BECE result checker cards</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>Bulk Upload</span>
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cards</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <CreditCard className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Available</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <Package className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sold</p>
                <p className="text-2xl font-bold text-blue-600">{stats.sold}</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Used</p>
                <p className="text-2xl font-bold text-purple-600">{stats.used}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">GHS {stats.totalValue}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by serial number or PIN..."
                  value={filters.search}
                  onChange={(e) => setFilters({...filters, search: e.target.value})}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <select
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Types</option>
              <option value="WASSCE">WASSCE</option>
              <option value="BECE">BECE</option>
            </select>

            <select
              value={filters.year}
              onChange={(e) => setFilters({...filters, year: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Years</option>
              {[2024, 2023, 2022, 2021, 2020].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">All Status</option>
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="used">Used</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {['inventory', 'batches', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm capitalize ${
                    activeTab === tab
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'inventory' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Card Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PIN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                        </div>
                      </td>
                    </tr>
                  ) : checkers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                        No cards found
                      </td>
                    </tr>
                  ) : (
                    checkers.map((checker) => (
                      <tr key={checker._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 font-mono">
                                {checker.serialNumber}
                              </div>
                              <div className="text-sm text-gray-500">
                                {checker.year} • {checker.examType}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                            {checker.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <Key className="w-4 h-4 text-gray-400" />
                            <span className="font-mono text-sm">{checker.pin}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold">GHS {checker.price}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(checker.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{checker.batchInfo.batchNumber.slice(0, 15)}...</div>
                            <div className="text-sm text-gray-500">
                              {new Date(checker.batchInfo.batchDate).toLocaleDateString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => {
                                setSelectedChecker(checker);
                                setShowDetailsModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              <Eye className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`${checker.serialNumber},${checker.pin}`);
                              }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              <Copy className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'batches' && (
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Recent Batches</h3>
                    <span className="text-sm text-gray-500">Last 30 days</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Archive className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium">BATCH-1704150000000</p>
                          <p className="text-sm text-gray-500">100 cards • WASSCE 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Jan 1, 2024</p>
                        <p className="text-sm font-medium">85 available</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Archive className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-medium">BATCH-1704236400000</p>
                          <p className="text-sm text-gray-500">50 cards • BECE 2024</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Jan 2, 2024</p>
                        <p className="text-sm font-medium">45 available</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Sales Performance</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Today's Sales</span>
                      <span className="font-medium">12 cards</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">This Week</span>
                      <span className="font-medium">67 cards</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">This Month</span>
                      <span className="font-medium">234 cards</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Revenue (Month)</span>
                      <span className="font-medium text-green-600">GHS 2,340</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Popular Types</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-sm">WASSCE 2024</span>
                      </div>
                      <span className="text-sm font-medium">156 sold</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-sm">BECE 2024</span>
                      </div>
                      <span className="text-sm font-medium">78 sold</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-sm">WASSCE 2023</span>
                      </div>
                      <span className="text-sm font-medium">45 sold</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-500">
            Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, stats.total)} of {stats.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilters({...filters, page: Math.max(1, filters.page - 1)})}
              disabled={filters.page === 1}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({...filters, page: filters.page + 1})}
              disabled={filters.page * filters.limit >= stats.total}
              className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>

        {/* Modals */}
        {showBulkUploadModal && <BulkUploadModal />}
        {showDetailsModal && <CheckerDetailsModal />}
      </div>
    // {/* </AdminLayout> */}
  );
}
// app/admin/pricing/page.js - Complete Pricing & Inventory Management with Fixed Input Handling
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  DollarSign, Package, TrendingUp, AlertCircle,
  Edit, Save, X, Plus, CheckCircle, XCircle,
  Wifi, WifiOff, Tag, Percent, Calendar,
  ArrowUp, ArrowDown, Settings, Database,
  RefreshCw, Info, Trash2
} from 'lucide-react';

export default function PricingInventory() {
  const [activeTab, setActiveTab] = useState('pricing');
  const [pricingData, setPricingData] = useState([]);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editData, setEditData] = useState({});
  const [stats, setStats] = useState({
    total: 0,
    inStock: 0,
    outOfStock: 0,
    avgMargin: 0
  });

  const networks = ['YELLO', 'MTN', 'TELECEL', 'AT_PREMIUM', 'AIRTELTIGO', 'AT'];
  const capacities = [0.5, 1, 2, 3, 5, 10, 15, 20, 25, 30, 50, 100];

  useEffect(() => {
    fetchPricingData();
    fetchInventoryData();
  }, []);

  useEffect(() => {
    if (pricingData.length > 0 && inventoryData.length === 0) {
      fetchInventoryData();
    }
  }, [pricingData]);

  const fetchPricingData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/pricing', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setPricingData(data.data || []);
        if (data.stats) {
          setStats({
            total: data.stats.total || 0,
            inStock: data.stats.inStock || 0,
            outOfStock: data.stats.outOfStock || 0,
            avgMargin: data.stats.avgMargin || 0
          });
        }
      } else {
        console.error('API Error:', data.message);
        setError(data.message || 'Failed to fetch pricing data');
        setTimeout(() => setError(''), 5000);
        setPricingData([]);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      setError('Failed to connect to server. Please check your connection.');
      setTimeout(() => setError(''), 5000);
      setPricingData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/inventory', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setInventoryData(data.data || []);
        
        if (data.data.length === 0 && pricingData.length > 0) {
          setError('Inventory not initialized. Click "Initialize Inventory" to set up stock management.');
          setTimeout(() => setError(''), 7000);
        }
      } else {
        console.error('Inventory API Error:', data.message);
        setInventoryData([]);
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventoryData([]);
    }
  };

  const initializeInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/inventory/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess(data.message || 'Inventory initialized successfully');
        fetchInventoryData();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        setError(data.message || 'Failed to initialize inventory');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error initializing inventory:', error);
      setError('Failed to initialize inventory');
      setTimeout(() => setError(''), 5000);
    }
  };

  const validatePricing = (prices) => {
    const adminCost = parseFloat(prices.adminCost);
    const dealer = parseFloat(prices.dealer);
    const superAgent = parseFloat(prices.superAgent);
    const agent = parseFloat(prices.agent);
    const user = parseFloat(prices.user);

    if (isNaN(adminCost) || isNaN(dealer) || isNaN(superAgent) || isNaN(agent) || isNaN(user)) {
      return { valid: false, message: 'All price fields must be valid numbers' };
    }

    if (adminCost < 0 || dealer < 0 || superAgent < 0 || agent < 0 || user < 0) {
      return { valid: false, message: 'Prices cannot be negative' };
    }

    if (adminCost >= dealer) {
      return { valid: false, message: 'Dealer price must be higher than admin cost' };
    }
    if (dealer >= superAgent) {
      return { valid: false, message: 'Super agent price must be higher than dealer price' };
    }
    if (superAgent >= agent) {
      return { valid: false, message: 'Agent price must be higher than super agent price' };
    }
    if (agent >= user) {
      return { valid: false, message: 'User price must be higher than agent price' };
    }

    return { valid: true };
  };

  const handleEditPricing = async (pricingId) => {
    setSubmitting(true);
    setError('');
    
    try {
      const validation = validatePricing(editData[pricingId]);
      if (!validation.valid) {
        setError(validation.message);
        setTimeout(() => setError(''), 5000);
        setSubmitting(false);
        return;
      }

      const payload = {
        prices: {
          adminCost: parseFloat(editData[pricingId].adminCost),
          dealer: parseFloat(editData[pricingId].dealer),
          superAgent: parseFloat(editData[pricingId].superAgent),
          agent: parseFloat(editData[pricingId].agent),
          user: parseFloat(editData[pricingId].user)
        }
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`https://cletech-server.onrender.com/api/admin/pricing/${pricingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Pricing updated successfully');
        setEditingId(null);
        setEditData({});
        fetchPricingData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update pricing');
        setTimeout(() => setError(''), 5000);
      }
    } catch (error) {
      console.error('Error updating pricing:', error);
      setError('Failed to update pricing. Please try again.');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePricing = async (pricingId) => {
    if (!window.confirm('Are you sure you want to delete this pricing? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://cletech-server.onrender.com/api/admin/pricing/${pricingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess('Pricing deleted successfully');
        fetchPricingData();
        fetchInventoryData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to delete pricing');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error deleting pricing:', error);
      setError('Failed to delete pricing');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleStockToggle = async (pricingId, stockType, currentValue) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://cletech-server.onrender.com/api/admin/pricing/${pricingId}/stock`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [stockType]: !currentValue })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Stock status updated');
        fetchPricingData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update stock status');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      setError('Failed to update stock status');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleInventoryToggle = async (network, stockType, currentValue) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://cletech-server.onrender.com/api/admin/inventory/${network}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [stockType]: !currentValue })
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setSuccess('Inventory updated');
        fetchInventoryData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update inventory');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      setError('Failed to update inventory');
      setTimeout(() => setError(''), 3000);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditData({
      [item._id]: {
        adminCost: item.prices.adminCost.toString(),
        dealer: item.prices.dealer.toString(),
        superAgent: item.prices.superAgent.toString(),
        agent: item.prices.agent.toString(),
        user: item.prices.user.toString()
      }
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditData({});
    setError('');
  };

  const handleEditFieldChange = (itemId, field, value) => {
    setEditData(prevData => ({
      ...prevData,
      [itemId]: {
        ...prevData[itemId],
        [field]: value
      }
    }));
  };

  const PricingTable = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Data Pricing Configuration
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={fetchPricingData}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add Pricing</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Network
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Capacity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Admin Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Dealer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Super Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Agent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Stock Status
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
            ) : pricingData.length === 0 ? (
              <tr>
                <td colSpan="9" className="px-6 py-12 text-center">
                  <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No pricing data available</p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="mt-3 text-purple-600 dark:text-purple-400 hover:underline text-sm"
                  >
                    Add your first pricing
                  </button>
                </td>
              </tr>
            ) : (
              pricingData.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        item.network === 'MTN' ? 'bg-yellow-500 dark:bg-yellow-400' :
                        item.network === 'TELECEL' ? 'bg-red-500 dark:bg-red-400' :
                        item.network === 'AT' ? 'bg-blue-500 dark:bg-blue-400' : 
                        'bg-gray-500 dark:bg-gray-400'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.network}
                      </span>
                      {item.isPopular && (
                        <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white font-medium">{item.capacity}GB</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item._id ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-purple-500"
                        value={editData[item._id]?.adminCost || ''}
                        onChange={(e) => handleEditFieldChange(item._id, 'adminCost', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEditPricing(item._id);
                          }
                          if (e.key === 'Escape') {
                            cancelEdit();
                          }
                        }}
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-white">
                        GHS {typeof item.prices.adminCost === 'number' ? item.prices.adminCost.toFixed(2) : '0.00'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item._id ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-purple-500"
                        value={editData[item._id]?.dealer || ''}
                        onChange={(e) => handleEditFieldChange(item._id, 'dealer', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEditPricing(item._id);
                          }
                          if (e.key === 'Escape') {
                            cancelEdit();
                          }
                        }}
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-white">
                        GHS {typeof item.prices.dealer === 'number' ? item.prices.dealer.toFixed(2) : '0.00'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item._id ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-purple-500"
                        value={editData[item._id]?.superAgent || ''}
                        onChange={(e) => handleEditFieldChange(item._id, 'superAgent', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEditPricing(item._id);
                          }
                          if (e.key === 'Escape') {
                            cancelEdit();
                          }
                        }}
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-white">
                        GHS {typeof item.prices.superAgent === 'number' ? item.prices.superAgent.toFixed(2) : '0.00'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item._id ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-purple-500"
                        value={editData[item._id]?.agent || ''}
                        onChange={(e) => handleEditFieldChange(item._id, 'agent', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEditPricing(item._id);
                          }
                          if (e.key === 'Escape') {
                            cancelEdit();
                          }
                        }}
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-white">
                        GHS {typeof item.prices.agent === 'number' ? item.prices.agent.toFixed(2) : '0.00'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item._id ? (
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded focus:ring-2 focus:ring-purple-500"
                        value={editData[item._id]?.user || ''}
                        onChange={(e) => handleEditFieldChange(item._id, 'user', e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleEditPricing(item._id);
                          }
                          if (e.key === 'Escape') {
                            cancelEdit();
                          }
                        }}
                      />
                    ) : (
                      <span className="text-sm text-gray-900 dark:text-white">
                        GHS {typeof item.prices.user === 'number' ? item.prices.user.toFixed(2) : '0.00'}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleStockToggle(item._id, 'webInStock', item.stock?.webInStock || false)}
                        className={`p-1 rounded transition-colors ${
                          item.stock?.webInStock 
                            ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50' 
                            : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50'
                        }`}
                        title="Web Stock"
                      >
                        {item.stock?.webInStock ? (
                          <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleStockToggle(item._id, 'apiInStock', item.stock?.apiInStock || false)}
                        className={`p-1 rounded transition-colors ${
                          item.stock?.apiInStock 
                            ? 'bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50' 
                            : 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50'
                        }`}
                        title="API Stock"
                      >
                        <Database className={`w-4 h-4 ${
                          item.stock?.apiInStock 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`} />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingId === item._id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditPricing(item._id)}
                          disabled={submitting}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 disabled:opacity-50"
                          title="Save changes"
                        >
                          <Save className="w-5 h-5" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={submitting}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                          title="Cancel editing"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => startEdit(item)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                          title="Edit pricing"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeletePricing(item._id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                          title="Delete pricing"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const InventoryStatus = () => (
    inventoryData.length === 0 ? (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-gray-500 dark:text-gray-400 mb-2">No inventory data available</p>
        {pricingData.length > 0 ? (
          <>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              You have pricing data but inventory hasn't been initialized yet.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={initializeInventory}
                className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
              >
                Initialize Inventory
              </button>
              <button
                onClick={fetchInventoryData}
                className="px-4 py-2 border border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
              >
                Refresh
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
              Add pricing for networks first, then inventory will be available
            </p>
            <button
              onClick={() => setActiveTab('pricing')}
              className="text-purple-600 dark:text-purple-400 hover:underline text-sm"
            >
              Go to Pricing Tab
            </button>
          </>
        )}
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {inventoryData.map((item) => (
          <div key={item.network || item._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.network}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {item.updatedAt ? new Date(item.updatedAt).toLocaleString() : 'Never'}
                </p>
              </div>
              <div className={`p-2 rounded-lg ${
                item.inStock 
                  ? 'bg-green-100 dark:bg-green-900/30' 
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <Package className={`w-5 h-5 ${
                  item.inStock 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Web Stock</span>
                <button
                  onClick={() => handleInventoryToggle(item.network, 'webInStock', item.webInStock)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    item.webInStock 
                      ? 'bg-green-600 dark:bg-green-700' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition ${
                    item.webInStock ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">API Stock</span>
                <button
                  onClick={() => handleInventoryToggle(item.network, 'apiInStock', item.apiInStock)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    item.apiInStock 
                      ? 'bg-green-600 dark:bg-green-700' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition ${
                    item.apiInStock ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Overall Status</span>
                <button
                  onClick={() => handleInventoryToggle(item.network, 'inStock', item.inStock)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                    item.inStock 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/40' 
                      : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/40'
                  } cursor-pointer`}
                >
                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                </button>
              </div>

              {(item.webLastUpdatedBy || item.apiLastUpdatedBy) && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  {item.webLastUpdatedBy && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Web updated by: {typeof item.webLastUpdatedBy === 'object' ? item.webLastUpdatedBy.name : item.webLastUpdatedBy}
                    </p>
                  )}
                  {item.apiLastUpdatedBy && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      API updated by: {typeof item.apiLastUpdatedBy === 'object' ? item.apiLastUpdatedBy.name : item.apiLastUpdatedBy}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  );

  const AddPricingModal = () => {
    const [localFormData, setLocalFormData] = useState({
      network: '',
      capacity: '',
      prices: {
        adminCost: '',
        dealer: '',
        superAgent: '',
        agent: '',
        user: ''
      },
      description: '',
      isPopular: false,
      tags: []
    });

    const handleLocalSubmit = async () => {
      setError('');
      setSubmitting(true);

      try {
        if (!localFormData.network || !localFormData.capacity) {
          setError('Please select network and capacity');
          setTimeout(() => setError(''), 5000);
          setSubmitting(false);
          return;
        }

        const validation = validatePricing(localFormData.prices);
        if (!validation.valid) {
          setError(validation.message);
          setTimeout(() => setError(''), 5000);
          setSubmitting(false);
          return;
        }

        const payload = {
          network: localFormData.network,
          capacity: parseFloat(localFormData.capacity),
          prices: {
            adminCost: parseFloat(localFormData.prices.adminCost),
            dealer: parseFloat(localFormData.prices.dealer),
            superAgent: parseFloat(localFormData.prices.superAgent),
            agent: parseFloat(localFormData.prices.agent),
            user: parseFloat(localFormData.prices.user)
          },
          description: localFormData.description || '',
          isPopular: localFormData.isPopular,
          tags: localFormData.tags
        };

        const token = localStorage.getItem('token');
        const response = await fetch('https://cletech-server.onrender.com/api/admin/pricing', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setSuccess('Pricing added successfully');
          setShowAddModal(false);
          fetchPricingData();
          fetchInventoryData();
          setLocalFormData({
            network: '',
            capacity: '',
            prices: { adminCost: '', dealer: '', superAgent: '', agent: '', user: '' },
            description: '',
            isPopular: false,
            tags: []
          });
          setTimeout(() => setSuccess(''), 3000);
        } else {
          setError(data.message || 'Failed to add pricing');
          setTimeout(() => setError(''), 5000);
        }
      } catch (error) {
        console.error('Error adding pricing:', error);
        setError('Failed to add pricing. Please try again.');
        setTimeout(() => setError(''), 5000);
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Pricing</h2>
            <button
              onClick={() => {
                setShowAddModal(false);
                setError('');
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Network *
              </label>
              <select
                value={localFormData.network}
                onChange={(e) => setLocalFormData({...localFormData, network: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="">Select Network</option>
                {networks.map(net => (
                  <option key={net} value={net}>{net}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Capacity (GB) *
              </label>
              <select
                value={localFormData.capacity}
                onChange={(e) => setLocalFormData({...localFormData, capacity: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="">Select Capacity</option>
                {capacities.map(cap => (
                  <option key={cap} value={cap}>{cap}GB</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pricing Structure *
              </label>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg mb-2">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Prices must increase progressively: Admin &lt; Dealer &lt; Super Agent &lt; Agent &lt; User
                  </p>
                </div>
              </div>
              {Object.keys(localFormData.prices).map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <label className="w-24 text-sm text-gray-600 dark:text-gray-400 capitalize">
                    {role === 'adminCost' ? 'Admin' : role === 'superAgent' ? 'S.Agent' : role}:
                  </label>
                  <div className="flex-1 relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
                      GHS
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      value={localFormData.prices[role]}
                      onChange={(e) => setLocalFormData({
                        ...localFormData,
                        prices: {...localFormData.prices, [role]: e.target.value}
                      })}
                      className="w-full pl-12 pr-3 py-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={localFormData.description}
                onChange={(e) => setLocalFormData({...localFormData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                rows="3"
                placeholder="Optional description..."
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPopular"
                checked={localFormData.isPopular}
                onChange={(e) => setLocalFormData({...localFormData, isPopular: e.target.checked})}
                className="w-4 h-4 text-purple-600 dark:text-purple-400 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
              />
              <label htmlFor="isPopular" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Mark as popular item
              </label>
            </div>
          </div>

          <div className="flex space-x-3 mt-6">
            <button
              onClick={handleLocalSubmit}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Adding...' : 'Add Pricing'}
            </button>
            <button
              onClick={() => {
                setShowAddModal(false);
                setError('');
              }}
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing & Inventory</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage data pricing and inventory status across all networks
        </p>
      </div>

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}
      {error && !showAddModal && !editingId && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total || pricingData.length}</p>
            </div>
            <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">In Stock</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.inStock || pricingData.filter(p => p.stock?.overallInStock !== false).length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.outOfStock || pricingData.filter(p => p.stock?.overallInStock === false).length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Margin</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.avgMargin || '0'}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'pricing'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Pricing Configuration
          </button>
          <button
            onClick={() => {
              setActiveTab('inventory');
              if (inventoryData.length === 0 || pricingData.length > inventoryData.length) {
                fetchInventoryData();
              }
            }}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'inventory'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Inventory Status
          </button>
          <button
            onClick={() => setActiveTab('promotions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'promotions'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Promotions
          </button>
        </nav>
      </div>

      {activeTab === 'pricing' && <PricingTable />}
      {activeTab === 'inventory' && (
        <div>
          {inventoryData.length > 0 && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Network Inventory Management
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchInventoryData}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-1"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh</span>
                </button>
                {pricingData.length > inventoryData.length && (
                  <button
                    onClick={initializeInventory}
                    className="px-3 py-1.5 text-sm bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
                  >
                    Sync Missing Networks
                  </button>
                )}
              </div>
            </div>
          )}
          <InventoryStatus />
        </div>
      )}
      {activeTab === 'promotions' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="text-center py-12">
            <Percent className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No Active Promotions
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Create promotional pricing to boost sales
            </p>
            <button className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors">
              Create Promotion
            </button>
          </div>
        </div>
      )}

      {showAddModal && <AddPricingModal />}
    </div>
  );
}
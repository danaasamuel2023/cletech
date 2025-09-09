// app/admin/order-monitoring/page.js - Complete Order Monitoring Dashboard
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Bell, Package, AlertCircle, Play, Pause, Settings, RefreshCw,
  Download, Clock, CheckCircle, XCircle, Send, MessageSquare,
  TrendingUp, Activity, Database, Wifi, Users, Phone,
  FileSpreadsheet, Search, Filter, Calendar, Info,
  ChevronRight, ChevronDown, Eye, Zap, Timer, 
  BarChart3, AlertTriangle, Mail, Hash, User
} from 'lucide-react';

export default function OrderMonitoring() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Automation state
  const [automationStatus, setAutomationStatus] = useState({
    isRunning: true,
    isPaused: false,
    lastCheck: null,
    nextCheck: null,
    settings: {
      checkInterval: 5,
      orderCountThreshold: 10,
      lookbackMinutes: 30,
      enableNotifications: true,
      adminNumbers: []
    }
  });
  
  // Dashboard stats
  const [stats, setStats] = useState({
    pendingOrders: 0,
    processingOrders: 0,
    todayAlerts: 0,
    weekAlerts: 0,
    pendingCapacity: 0,
    totalAlerts: 0,
    totalOrdersProcessed: 0
  });
  
  // Alerts data
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [alertDetails, setAlertDetails] = useState(null);
  const [alertPage, setAlertPage] = useState(1);
  const [alertsLoading, setAlertsLoading] = useState(false);
  
  // Messages data
  const [messages, setMessages] = useState([]);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesLoading, setMessagesLoading] = useState(false);
  
  // Settings modal
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    checkInterval: 5,
    orderCountThreshold: 10,
    lookbackMinutes: 30,
    enableNotifications: true,
    adminNumbers: ''
  });
  
  // Test WhatsApp modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testForm, setTestForm] = useState({
    phoneNumber: '',
    message: ''
  });
  
  // Delivery modal
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    alertId: '',
    orderReferences: [],
    deliveryNotes: ''
  });

  useEffect(() => {
    fetchDashboardData();
    fetchAutomationStatus();
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchAutomationStatus();
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'alerts') {
      fetchAlerts();
    } else if (activeTab === 'messages') {
      fetchMessages();
    }
  }, [activeTab, alertPage, messagesPage]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/monitoring/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setStats(data.data.statistics);
        setAutomationStatus(data.data.automation);
      }
    } catch (error) {
      console.error('Error fetching dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAutomationStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/monitoring/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setAutomationStatus({
          isRunning: data.data.isRunning,
          isPaused: data.data.control?.isPaused || false,
          lastCheck: data.data.lastCheck,
          nextCheck: data.data.nextCheck,
          settings: data.data.control?.settings || automationStatus.settings
        });
      }
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const fetchAlerts = async () => {
    setAlertsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://cletech-server.onrender.com/api/admin/monitoring/alerts?page=${alertPage}&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      if (response.ok && data.success) {
        setAlerts(data.data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setAlertsLoading(false);
    }
  };

  const fetchAlertDetails = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://cletech-server.onrender.com/api/admin/monitoring/alerts/${alertId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      if (response.ok && data.success) {
        setAlertDetails(data.data);
        setSelectedAlert(alertId);
      }
    } catch (error) {
      console.error('Error fetching alert details:', error);
      setError('Failed to fetch alert details');
      setTimeout(() => setError(''), 3000);
    }
  };

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://cletech-server.onrender.com/api/admin/monitoring/messages?page=${messagesPage}&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      const data = await response.json();
      if (response.ok && data.success) {
        setMessages(data.data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handlePauseAutomation = async () => {
    const reason = prompt('Please provide a reason for pausing the automation:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/monitoring/pause', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Automation paused successfully');
        setAutomationStatus(prev => ({ ...prev, isPaused: true, isRunning: false }));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to pause automation');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error pausing automation:', error);
      setError('Failed to pause automation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleResumeAutomation = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/monitoring/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Automation resumed successfully');
        setAutomationStatus(prev => ({ ...prev, isPaused: false, isRunning: true }));
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to resume automation');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error resuming automation:', error);
      setError('Failed to resume automation');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleManualTrigger = async (forceAlert = false) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/monitoring/trigger-check', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ forceAlert })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(data.message || 'Manual check completed');
        fetchDashboardData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to trigger check');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error triggering check:', error);
      setError('Failed to trigger manual check');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...settingsForm,
        adminNumbers: settingsForm.adminNumbers.split(',').map(n => n.trim()).filter(n => n)
      };
      
      const response = await fetch('https://cletech-server.onrender.com/api/admin/monitoring/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Settings updated successfully');
        setShowSettingsModal(false);
        fetchAutomationStatus();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to update settings');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleTestWhatsApp = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/monitoring/test-whatsapp', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testForm)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess('Test message sent successfully');
        setShowTestModal(false);
        setTestForm({ phoneNumber: '', message: '' });
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to send test message');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error sending test:', error);
      setError('Failed to send test message');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleMarkDelivered = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/monitoring/mark-delivered', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(deliveryForm)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccess(`${data.data.ordersUpdated} orders marked as delivered`);
        setShowDeliveryModal(false);
        setDeliveryForm({ alertId: '', orderReferences: [], deliveryNotes: '' });
        fetchAlerts();
        fetchDashboardData();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to mark orders as delivered');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error marking delivered:', error);
      setError('Failed to mark orders as delivered');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDownloadExcel = async (alertId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://cletech-server.onrender.com/api/admin/monitoring/download/${alertId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders_${alertId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setSuccess('Excel file downloaded successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to download Excel file');
        setTimeout(() => setError(''), 3000);
      }
    } catch (error) {
      console.error('Error downloading Excel:', error);
      setError('Failed to download Excel file');
      setTimeout(() => setError(''), 3000);
    }
  };

  const DashboardTab = () => (
    <div className="space-y-6">
      {/* Automation Status Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Automation Status
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Real-time monitoring and alert system for pending orders
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {automationStatus.isRunning ? (
              <button
                onClick={handlePauseAutomation}
                className="px-4 py-2 bg-red-600 dark:bg-red-700 text-white rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors flex items-center space-x-2"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={handleResumeAutomation}
                className="px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Resume</span>
              </button>
            )}
            <button
              onClick={() => {
                setSettingsForm({
                  checkInterval: automationStatus.settings?.checkInterval || 5,
                  orderCountThreshold: automationStatus.settings?.orderCountThreshold || 10,
                  lookbackMinutes: automationStatus.settings?.lookbackMinutes || 30,
                  enableNotifications: automationStatus.settings?.enableNotifications || true,
                  adminNumbers: automationStatus.settings?.adminNumbers?.join(', ') || ''
                });
                setShowSettingsModal(true);
              }}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                automationStatus.isRunning
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
              }`}>
                {automationStatus.isRunning ? 'Running' : 'Paused'}
              </div>
            </div>
            <div className="flex items-center">
              <Activity className={`w-8 h-8 mr-3 ${
                automationStatus.isRunning 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`} />
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {automationStatus.isRunning ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Last Check</span>
              <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              {automationStatus.lastCheck 
                ? new Date(automationStatus.lastCheck).toLocaleTimeString()
                : 'Never'
              }
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {automationStatus.lastCheck 
                ? new Date(automationStatus.lastCheck).toLocaleDateString()
                : 'No checks yet'
              }
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Check Interval</span>
              <Timer className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Every {automationStatus.settings?.checkInterval || 5} minutes
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Threshold: {automationStatus.settings?.orderCountThreshold || 10} orders
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Orders</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingOrders}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.pendingCapacity} GB capacity
              </p>
            </div>
            <Package className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Today's Alerts</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.todayAlerts}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {stats.weekAlerts} this week
              </p>
            </div>
            <Bell className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Processing</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.processingOrders}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Active orders
              </p>
            </div>
            <Activity className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Processed</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.totalOrdersProcessed}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                All time
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleManualTrigger(false)}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Manual Check</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Run order check now
            </p>
          </button>

          <button
            onClick={() => handleManualTrigger(true)}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Force Alert</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Send alert regardless of threshold
            </p>
          </button>

          <button
            onClick={() => setShowTestModal(true)}
            className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <p className="font-medium text-gray-900 dark:text-white">Test WhatsApp</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Send test message
            </p>
          </button>
        </div>
      </div>
    </div>
  );

  const AlertsTab = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Order Alerts History
            </h2>
            <button
              onClick={fetchAlerts}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${alertsLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Alert ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Orders
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Total Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {alertsLoading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
                    </div>
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">No alerts found</p>
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr key={alert._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900 dark:text-white">
                        {alert.alertId}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white font-medium">
                        {alert.orderCount || alert.orders?.length || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {alert.totalCapacity || 0} GB
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        alert.status === 'processed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : alert.status === 'sent'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {alert.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(alert.createdAt).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => fetchAlertDetails(alert.alertId)}
                          className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
                          title="View details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadExcel(alert.alertId)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          title="Download Excel"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        {alert.status !== 'processed' && (
                          <button
                            onClick={() => {
                              setDeliveryForm({
                                alertId: alert.alertId,
                                orderReferences: alert.orders?.map(o => o.reference) || [],
                                deliveryNotes: ''
                              });
                              setShowDeliveryModal(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            title="Mark as delivered"
                          >
                            <CheckCircle className="w-5 h-5" />
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

        {/* Pagination */}
        {alerts.length > 0 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setAlertPage(prev => Math.max(1, prev - 1))}
                disabled={alertPage === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {alertPage}
              </span>
              <button
                onClick={() => setAlertPage(prev => prev + 1)}
                disabled={alerts.length < 20}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Alert Details Modal */}
      {alertDetails && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alert Details - {alertDetails.alert?.alertId}
            </h3>
            <button
              onClick={() => {
                setAlertDetails(null);
                setSelectedAlert(null);
              }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {alertDetails.alert?.status || 'pending'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Order Count</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {alertDetails.orders?.length || 0} orders
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Capacity</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {alertDetails.alert?.totalCapacity || 0} GB
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Created At</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(alertDetails.alert?.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Reference
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Phone
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Network
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Capacity
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {alertDetails.orders?.map((order) => (
                  <tr key={order._id}>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white font-mono">
                      {order.reference}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      {order.phoneNumber}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      {order.network}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                      {order.capacity} GB
                    </td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        order.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const MessagesTab = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            WhatsApp Message Logs
          </h2>
          <button
            onClick={fetchMessages}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${messagesLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Recipient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Sent At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Message Preview
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {messagesLoading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 dark:border-purple-400"></div>
                  </div>
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center">
                  <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No messages found</p>
                </td>
              </tr>
            ) : (
              messages.map((message) => (
                <tr key={message._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      message.messageType === 'alert'
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300'
                        : message.messageType === 'test'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}>
                      {message.messageType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 dark:text-white">
                      {message.recipient}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      message.status === 'sent'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : message.status === 'failed'
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300'
                    }`}>
                      {message.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(message.sentAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                      {message.message?.substring(0, 50)}...
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {messages.length > 0 && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={() => setMessagesPage(prev => Math.max(1, prev - 1))}
              disabled={messagesPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Page {messagesPage}
            </span>
            <button
              onClick={() => setMessagesPage(prev => prev + 1)}
              disabled={messages.length < 50}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Settings Modal
  const SettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Automation Settings</h2>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Check Interval (minutes)
            </label>
            <input
              type="number"
              value={settingsForm.checkInterval}
              onChange={(e) => setSettingsForm({...settingsForm, checkInterval: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="1"
              max="60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Order Count Threshold
            </label>
            <input
              type="number"
              value={settingsForm.orderCountThreshold}
              onChange={(e) => setSettingsForm({...settingsForm, orderCountThreshold: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="1"
              max="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Lookback Minutes
            </label>
            <input
              type="number"
              value={settingsForm.lookbackMinutes}
              onChange={(e) => setSettingsForm({...settingsForm, lookbackMinutes: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              min="5"
              max="1440"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Phone Numbers (comma-separated)
            </label>
            <input
              type="text"
              value={settingsForm.adminNumbers}
              onChange={(e) => setSettingsForm({...settingsForm, adminNumbers: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="233XXXXXXXXX, 233XXXXXXXXX"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enableNotifications"
              checked={settingsForm.enableNotifications}
              onChange={(e) => setSettingsForm({...settingsForm, enableNotifications: e.target.checked})}
              className="w-4 h-4 text-purple-600 dark:text-purple-400 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="enableNotifications" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Enable WhatsApp notifications
            </label>
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleUpdateSettings}
            className="flex-1 px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors"
          >
            Save Settings
          </button>
          <button
            onClick={() => setShowSettingsModal(false)}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Test WhatsApp Modal
  const TestWhatsAppModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Test WhatsApp Message</h2>
          <button
            onClick={() => {
              setShowTestModal(false);
              setTestForm({ phoneNumber: '', message: '' });
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={testForm.phoneNumber}
              onChange={(e) => setTestForm({...testForm, phoneNumber: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="233XXXXXXXXX"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Message
            </label>
            <textarea
              value={testForm.message}
              onChange={(e) => setTestForm({...testForm, message: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="4"
              placeholder="Test message content..."
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleTestWhatsApp}
            className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <Send className="w-5 h-5" />
            <span>Send Test</span>
          </button>
          <button
            onClick={() => {
              setShowTestModal(false);
              setTestForm({ phoneNumber: '', message: '' });
            }}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  // Mark Delivered Modal
  const DeliveryModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mark Orders as Delivered</h2>
          <button
            onClick={() => {
              setShowDeliveryModal(false);
              setDeliveryForm({ alertId: '', orderReferences: [], deliveryNotes: '' });
            }}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <XCircle className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Alert ID
            </label>
            <input
              type="text"
              value={deliveryForm.alertId}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Number of Orders
            </label>
            <input
              type="text"
              value={`${deliveryForm.orderReferences.length} orders selected`}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Delivery Notes
            </label>
            <textarea
              value={deliveryForm.deliveryNotes}
              onChange={(e) => setDeliveryForm({...deliveryForm, deliveryNotes: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows="3"
              placeholder="Optional notes..."
            />
          </div>
        </div>

        <div className="flex space-x-3 mt-6">
          <button
            onClick={handleMarkDelivered}
            className="flex-1 px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors"
          >
            Mark as Delivered
          </button>
          <button
            onClick={() => {
              setShowDeliveryModal(false);
              setDeliveryForm({ alertId: '', orderReferences: [], deliveryNotes: '' });
            }}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Order Monitoring</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Real-time order tracking and automated alert system
        </p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 rounded-lg">
          <p className="text-sm text-green-700 dark:text-green-300">{success}</p>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'dashboard'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'alerts'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Alerts
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'messages'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Messages
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 dark:border-purple-400"></div>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'alerts' && <AlertsTab />}
          {activeTab === 'messages' && <MessagesTab />}
        </>
      )}

      {/* Modals */}
      {showSettingsModal && <SettingsModal />}
      {showTestModal && <TestWhatsAppModal />}
      {showDeliveryModal && <DeliveryModal />}
    </div>
  );
}
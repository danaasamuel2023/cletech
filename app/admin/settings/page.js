// app/admin/settings/page.js - System Settings Management with Dark Mode
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, Shield, DollarSign, Bell, Database, Globe,
  Key, Users, Store, Package, CreditCard, Mail,
  Phone, AlertCircle, Save, RefreshCw, Lock, Unlock,
  Monitor, Server, Activity, FileText, MessageSquare,
  Zap, Clock, CheckCircle, XCircle, Eye, EyeOff,
  Upload, Download, Trash2, Edit, Plus, ChevronDown,
  Wifi, WifiOff, ToggleLeft, ToggleRight, Info, Wallet, TrendingUp
} from 'lucide-react';

export default function SystemSettings() {
  const [activeTab, setActiveTab] = useState('platform');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showPassword, setShowPassword] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (category, data) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      
      // Map frontend tab names to backend route names
      const routeMap = {
        'users': 'user-management',
        'payment': 'payment-gateway',
        'stores': 'agent-store',
        'pricing': 'pricing',
        'api': 'api',
        'security': 'security',
        'maintenance': 'maintenance',
        'notifications': 'notifications',
        'financial': 'financial',
        'platform': 'platform'
      };
      
      const routeName = routeMap[category] || category;
      
      const response = await fetch(`https://api.cletech.shop/api/admin/settings/${routeName}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        const result = await response.json();
        setSettings(prev => ({
          ...prev,
          [category]: result.data
        }));
        setHasChanges(false);
        // Show success notification
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMaintenanceMode = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/admin/settings/maintenance/toggle', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !settings.platform?.maintenanceMode,
          message: settings.platform?.maintenanceMessage
        })
      });
      
      if (response.ok) {
        fetchSettings();
      }
    } catch (error) {
      console.error('Error toggling maintenance mode:', error);
    }
  };

  const handleExportSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/admin/settings/export', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `settings-export-${new Date().toISOString()}.json`;
        a.click();
      }
    } catch (error) {
      console.error('Error exporting settings:', error);
    }
  };

  const ToggleSwitch = ({ enabled, onChange, label }) => (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`block w-14 h-8 rounded-full transition-colors ${
          enabled ? 'bg-purple-600 dark:bg-purple-700' : 'bg-gray-300 dark:bg-gray-600'
        }`}></div>
        <div className={`absolute left-1 top-1 bg-white dark:bg-gray-200 w-6 h-6 rounded-full transition ${
          enabled ? 'transform translate-x-6' : ''
        }`}></div>
      </div>
      {label && (
        <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      )}
    </label>
  );

  const SettingCard = ({ title, description, children, icon: Icon }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-start space-x-4">
        {Icon && (
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Icon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
        )}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          )}
          <div className="mt-4">{children}</div>
        </div>
      </div>
    </div>
  );

  if (loading) {
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Configure and manage platform settings</p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Maintenance Mode Quick Toggle */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-400">Maintenance</span>
              <button
                onClick={handleToggleMaintenanceMode}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.platform?.maintenanceMode 
                    ? 'bg-red-600 dark:bg-red-700' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-gray-200 transition ${
                  settings.platform?.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <button
              onClick={handleExportSettings}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
            
            <button
              onClick={() => fetchSettings()}
              className="px-4 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {[
              { id: 'platform', label: 'Platform', icon: Globe },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'financial', label: 'Financial', icon: DollarSign },
              { id: 'payment', label: 'Payment', icon: CreditCard },
              { id: 'pricing', label: 'Pricing', icon: Package },
              { id: 'stores', label: 'Stores', icon: Store },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'api', label: 'API', icon: Key },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'maintenance', label: 'Maintenance', icon: Server }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Platform Settings */}
          {activeTab === 'platform' && (
            <div className="space-y-6">
              <SettingCard
                title="General Information"
                description="Basic platform configuration"
                icon={Globe}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.platform?.siteName || ''}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          platform: { ...prev.platform, siteName: e.target.value }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Site URL
                    </label>
                    <input
                      type="url"
                      value={settings.platform?.siteUrl || ''}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          platform: { ...prev.platform, siteUrl: e.target.value }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Admin Email
                    </label>
                    <input
                      type="email"
                      value={settings.platform?.adminEmail || ''}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          platform: { ...prev.platform, adminEmail: e.target.value }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Support Email
                    </label>
                    <input
                      type="email"
                      value={settings.platform?.supportEmail || ''}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          platform: { ...prev.platform, supportEmail: e.target.value }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Support Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.platform?.supportPhone || ''}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          platform: { ...prev.platform, supportPhone: e.target.value }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timezone
                    </label>
                    <select
                      value={settings.platform?.timezone || 'Africa/Accra'}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          platform: { ...prev.platform, timezone: e.target.value }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    >
                      <option value="Africa/Accra">Africa/Accra (GMT)</option>
                      <option value="Europe/London">Europe/London (BST)</option>
                      <option value="America/New_York">America/New_York (EST)</option>
                    </select>
                  </div>
                </div>
              </SettingCard>

              <SettingCard
                title="System Announcement"
                description="Display a message to all users"
                icon={AlertCircle}
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={settings.platform?.announcementActive || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        platform: { ...prev.platform, announcementActive: enabled }
                      }));
                      setHasChanges(true);
                    }}
                    label="Enable System Announcement"
                  />
                  
                  {settings.platform?.announcementActive && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Announcement Type
                        </label>
                        <select
                          value={settings.platform?.announcementType || 'info'}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              platform: { ...prev.platform, announcementType: e.target.value }
                            }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                        >
                          <option value="info">Info</option>
                          <option value="warning">Warning</option>
                          <option value="success">Success</option>
                          <option value="error">Error</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Message
                        </label>
                        <textarea
                          value={settings.platform?.systemAnnouncement || ''}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              platform: { ...prev.platform, systemAnnouncement: e.target.value }
                            }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          rows="3"
                        />
                      </div>
                    </>
                  )}
                </div>
              </SettingCard>
            </div>
          )}

          {/* User Management Settings */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <SettingCard
                title="Registration Settings"
                description="Configure user registration process"
                icon={Users}
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={settings.userManagement?.registration?.autoApprove || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        userManagement: {
                          ...prev.userManagement,
                          registration: {
                            ...prev.userManagement?.registration,
                            autoApprove: enabled
                          }
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Auto-approve new registrations"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.userManagement?.registration?.requireEmailVerification || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        userManagement: {
                          ...prev.userManagement,
                          registration: {
                            ...prev.userManagement?.registration,
                            requireEmailVerification: enabled
                          }
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Require email verification"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.userManagement?.registration?.requirePhoneVerification || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        userManagement: {
                          ...prev.userManagement,
                          registration: {
                            ...prev.userManagement?.registration,
                            requirePhoneVerification: enabled
                          }
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Require phone verification"
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Role
                    </label>
                    <select
                      value={settings.userManagement?.registration?.defaultRole || 'user'}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          userManagement: {
                            ...prev.userManagement,
                            registration: {
                              ...prev.userManagement?.registration,
                              defaultRole: e.target.value
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    >
                      <option value="user">User</option>
                      <option value="agent">Agent</option>
                    </select>
                  </div>
                </div>
              </SettingCard>

              <SettingCard
                title="Security Settings"
                description="Password and authentication requirements"
                icon={Lock}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Password Length
                    </label>
                    <input
                      type="number"
                      value={settings.userManagement?.security?.passwordMinLength || 8}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          userManagement: {
                            ...prev.userManagement,
                            security: {
                              ...prev.userManagement?.security,
                              passwordMinLength: parseInt(e.target.value)
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="6"
                      max="32"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Login Attempts
                    </label>
                    <input
                      type="number"
                      value={settings.userManagement?.security?.maxLoginAttempts || 5}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          userManagement: {
                            ...prev.userManagement,
                            security: {
                              ...prev.userManagement?.security,
                              maxLoginAttempts: parseInt(e.target.value)
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="3"
                      max="10"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Lockout Duration (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.userManagement?.security?.lockoutDuration || 30}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          userManagement: {
                            ...prev.userManagement,
                            security: {
                              ...prev.userManagement?.security,
                              lockoutDuration: parseInt(e.target.value)
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="5"
                      max="1440"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Session Timeout (minutes)
                    </label>
                    <input
                      type="number"
                      value={settings.userManagement?.security?.sessionTimeout || 60}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          userManagement: {
                            ...prev.userManagement,
                            security: {
                              ...prev.userManagement?.security,
                              sessionTimeout: parseInt(e.target.value)
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="15"
                      max="1440"
                    />
                  </div>
                </div>
                
                <div className="mt-4 space-y-3">
                  <ToggleSwitch
                    enabled={settings.userManagement?.security?.passwordRequireUppercase || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        userManagement: {
                          ...prev.userManagement,
                          security: {
                            ...prev.userManagement?.security,
                            passwordRequireUppercase: enabled
                          }
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Require uppercase letters"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.userManagement?.security?.passwordRequireNumbers || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        userManagement: {
                          ...prev.userManagement,
                          security: {
                            ...prev.userManagement?.security,
                            passwordRequireNumbers: enabled
                          }
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Require numbers"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.userManagement?.security?.passwordRequireSymbols || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        userManagement: {
                          ...prev.userManagement,
                          security: {
                            ...prev.userManagement?.security,
                            passwordRequireSymbols: enabled
                          }
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Require special characters"
                  />
                </div>
              </SettingCard>
            </div>
          )}

          {/* Financial Settings */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <SettingCard
                title="Wallet Configuration"
                description="Set wallet limits and defaults"
                icon={Wallet}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Min Balance (GHS)
                    </label>
                    <input
                      type="number"
                      value={settings.financial?.wallet?.minBalance || 0}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          financial: {
                            ...prev.financial,
                            wallet: {
                              ...prev.financial?.wallet,
                              minBalance: parseFloat(e.target.value)
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Balance (GHS)
                    </label>
                    <input
                      type="number"
                      value={settings.financial?.wallet?.maxBalance || 1000000}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          financial: {
                            ...prev.financial,
                            wallet: {
                              ...prev.financial?.wallet,
                              maxBalance: parseFloat(e.target.value)
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="1000"
                      step="1000"
                    />
                  </div>
                </div>
              </SettingCard>

              <SettingCard
                title="Transaction Limits"
                description="Configure transaction restrictions"
                icon={CreditCard}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Daily Limit (GHS)
                    </label>
                    <input
                      type="number"
                      value={settings.financial?.transactions?.dailyLimit || 50000}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          financial: {
                            ...prev.financial,
                            transactions: {
                              ...prev.financial?.transactions,
                              dailyLimit: parseFloat(e.target.value)
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="100"
                      step="100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weekly Limit (GHS)
                    </label>
                    <input
                      type="number"
                      value={settings.financial?.transactions?.weeklyLimit || 200000}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          financial: {
                            ...prev.financial,
                            transactions: {
                              ...prev.financial?.transactions,
                              weeklyLimit: parseFloat(e.target.value)
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="1000"
                      step="1000"
                    />
                  </div>
                </div>
              </SettingCard>

              <SettingCard
                title="Commission Structure"
                description="Set commission rates for each role"
                icon={TrendingUp}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Super Agent (%)
                    </label>
                    <input
                      type="number"
                      value={settings.financial?.commissions?.structure?.super_agent || 15}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          financial: {
                            ...prev.financial,
                            commissions: {
                              ...prev.financial?.commissions,
                              structure: {
                                ...prev.financial?.commissions?.structure,
                                super_agent: parseFloat(e.target.value)
                              }
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Dealer (%)
                    </label>
                    <input
                      type="number"
                      value={settings.financial?.commissions?.structure?.dealer || 12}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          financial: {
                            ...prev.financial,
                            commissions: {
                              ...prev.financial?.commissions,
                              structure: {
                                ...prev.financial?.commissions?.structure,
                                dealer: parseFloat(e.target.value)
                              }
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Agent (%)
                    </label>
                    <input
                      type="number"
                      value={settings.financial?.commissions?.structure?.agent || 10}
                      onChange={(e) => {
                        setSettings(prev => ({
                          ...prev,
                          financial: {
                            ...prev.financial,
                            commissions: {
                              ...prev.financial?.commissions,
                              structure: {
                                ...prev.financial?.commissions?.structure,
                                agent: parseFloat(e.target.value)
                              }
                            }
                          }
                        }));
                        setHasChanges(true);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                      min="0"
                      max="50"
                      step="0.1"
                    />
                  </div>
                </div>
              </SettingCard>
            </div>
          )}

          {/* Payment Gateway Settings - UPDATED */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <SettingCard
                title="Paystack Configuration"
                description="Configure Paystack payment gateway"
                icon={CreditCard}
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={settings.paymentGateway?.paystack?.enabled || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        paymentGateway: {
                          ...prev.paymentGateway,
                          paystack: {
                            ...prev.paymentGateway?.paystack,
                            enabled: enabled
                          }
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Enable Paystack"
                  />
                  
                  {settings.paymentGateway?.paystack?.enabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Public Key
                        </label>
                        <input
                          type="text"
                          value={settings.paymentGateway?.paystack?.publicKey || ''}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              paymentGateway: {
                                ...prev.paymentGateway,
                                paystack: {
                                  ...prev.paymentGateway?.paystack,
                                  publicKey: e.target.value
                                }
                              }
                            }));
                            setHasChanges(true);
                          }}
                          placeholder="pk_live_..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Secret Key
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.paystackSecret ? "text" : "password"}
                            value={settings.paymentGateway?.paystack?.secretKey || ''}
                            onChange={(e) => {
                              setSettings(prev => ({
                                ...prev,
                                paymentGateway: {
                                  ...prev.paymentGateway,
                                  paystack: {
                                    ...prev.paymentGateway?.paystack,
                                    secretKey: e.target.value
                                  }
                                }
                              }));
                              setHasChanges(true);
                            }}
                            placeholder="sk_live_..."
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({
                              ...prev,
                              paystackSecret: !prev.paystackSecret
                            }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {showPassword.paystackSecret ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Stores API Key
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword.storesApikey ? "text" : "password"}
                            value={settings.paymentGateway?.paystack?.storesApikey || ''}
                            onChange={(e) => {
                              setSettings(prev => ({
                                ...prev,
                                paymentGateway: {
                                  ...prev.paymentGateway,
                                  paystack: {
                                    ...prev.paymentGateway?.paystack,
                                    storesApikey: e.target.value
                                  }
                                }
                              }));
                              setHasChanges(true);
                            }}
                            placeholder="sk_live_stores_..."
                            className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(prev => ({
                              ...prev,
                              storesApikey: !prev.storesApikey
                            }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                          >
                            {showPassword.storesApikey ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Separate API key for agent stores transactions
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Webhook URL
                        </label>
                        <input
                          type="url"
                          value={settings.paymentGateway?.paystack?.webhookUrl || ''}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              paymentGateway: {
                                ...prev.paymentGateway,
                                paystack: {
                                  ...prev.paymentGateway?.paystack,
                                  webhookUrl: e.target.value
                                }
                              }
                            }));
                            setHasChanges(true);
                          }}
                          placeholder="https://yourdomain.com/webhook/paystack"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Transaction Fee (%)
                        </label>
                        <input
                          type="number"
                          value={settings.paymentGateway?.paystack?.transactionFee || 1.95}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              paymentGateway: {
                                ...prev.paymentGateway,
                                paystack: {
                                  ...prev.paymentGateway?.paystack,
                                  transactionFee: parseFloat(e.target.value)
                                }
                              }
                            }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          min="0"
                          max="10"
                          step="0.01"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Fee Cap (GHS)
                        </label>
                        <input
                          type="number"
                          value={settings.paymentGateway?.paystack?.capAt || 100}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              paymentGateway: {
                                ...prev.paymentGateway,
                                paystack: {
                                  ...prev.paymentGateway?.paystack,
                                  capAt: parseFloat(e.target.value)
                                }
                              }
                            }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          min="0"
                          step="1"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </SettingCard>

              <SettingCard
                title="Mobile Money Configuration"
                description="Configure mobile money providers"
                icon={Phone}
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={settings.paymentGateway?.momo?.enabled || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        paymentGateway: {
                          ...prev.paymentGateway,
                          momo: {
                            ...prev.paymentGateway?.momo,
                            enabled: enabled
                          }
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Enable Mobile Money"
                  />
                  
                  {settings.paymentGateway?.momo?.enabled && (
                    <div className="space-y-4">
                      {/* MTN Mobile Money */}
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">MTN Mobile Money</h4>
                          <ToggleSwitch
                            enabled={settings.paymentGateway?.momo?.providers?.mtn?.enabled || false}
                            onChange={(enabled) => {
                              setSettings(prev => ({
                                ...prev,
                                paymentGateway: {
                                  ...prev.paymentGateway,
                                  momo: {
                                    ...prev.paymentGateway?.momo,
                                    providers: {
                                      ...prev.paymentGateway?.momo?.providers,
                                      mtn: {
                                        ...prev.paymentGateway?.momo?.providers?.mtn,
                                        enabled: enabled
                                      }
                                    }
                                  }
                                }
                              }));
                              setHasChanges(true);
                            }}
                          />
                        </div>
                        {settings.paymentGateway?.momo?.providers?.mtn?.enabled && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Transaction Fee (%)
                            </label>
                            <input
                              type="number"
                              value={settings.paymentGateway?.momo?.providers?.mtn?.fee || 1}
                              onChange={(e) => {
                                setSettings(prev => ({
                                  ...prev,
                                  paymentGateway: {
                                    ...prev.paymentGateway,
                                    momo: {
                                      ...prev.paymentGateway?.momo,
                                      providers: {
                                        ...prev.paymentGateway?.momo?.providers,
                                        mtn: {
                                          ...prev.paymentGateway?.momo?.providers?.mtn,
                                          fee: parseFloat(e.target.value)
                                        }
                                      }
                                    }
                                  }
                                }));
                                setHasChanges(true);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                              min="0"
                              max="10"
                              step="0.1"
                            />
                          </div>
                        )}
                      </div>

                      {/* Vodafone Cash */}
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">Vodafone Cash</h4>
                          <ToggleSwitch
                            enabled={settings.paymentGateway?.momo?.providers?.vodafone?.enabled || false}
                            onChange={(enabled) => {
                              setSettings(prev => ({
                                ...prev,
                                paymentGateway: {
                                  ...prev.paymentGateway,
                                  momo: {
                                    ...prev.paymentGateway?.momo,
                                    providers: {
                                      ...prev.paymentGateway?.momo?.providers,
                                      vodafone: {
                                        ...prev.paymentGateway?.momo?.providers?.vodafone,
                                        enabled: enabled
                                      }
                                    }
                                  }
                                }
                              }));
                              setHasChanges(true);
                            }}
                          />
                        </div>
                        {settings.paymentGateway?.momo?.providers?.vodafone?.enabled && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Transaction Fee (%)
                            </label>
                            <input
                              type="number"
                              value={settings.paymentGateway?.momo?.providers?.vodafone?.fee || 1}
                              onChange={(e) => {
                                setSettings(prev => ({
                                  ...prev,
                                  paymentGateway: {
                                    ...prev.paymentGateway,
                                    momo: {
                                      ...prev.paymentGateway?.momo,
                                      providers: {
                                        ...prev.paymentGateway?.momo?.providers,
                                        vodafone: {
                                          ...prev.paymentGateway?.momo?.providers?.vodafone,
                                          fee: parseFloat(e.target.value)
                                        }
                                      }
                                    }
                                  }
                                }));
                                setHasChanges(true);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                              min="0"
                              max="10"
                              step="0.1"
                            />
                          </div>
                        )}
                      </div>

                      {/* AirtelTigo Money */}
                      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium text-gray-900 dark:text-white">AirtelTigo Money</h4>
                          <ToggleSwitch
                            enabled={settings.paymentGateway?.momo?.providers?.airteltigo?.enabled || false}
                            onChange={(enabled) => {
                              setSettings(prev => ({
                                ...prev,
                                paymentGateway: {
                                  ...prev.paymentGateway,
                                  momo: {
                                    ...prev.paymentGateway?.momo,
                                    providers: {
                                      ...prev.paymentGateway?.momo?.providers,
                                      airteltigo: {
                                        ...prev.paymentGateway?.momo?.providers?.airteltigo,
                                        enabled: enabled
                                      }
                                    }
                                  }
                                }
                              }));
                              setHasChanges(true);
                            }}
                          />
                        </div>
                        {settings.paymentGateway?.momo?.providers?.airteltigo?.enabled && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Transaction Fee (%)
                            </label>
                            <input
                              type="number"
                              value={settings.paymentGateway?.momo?.providers?.airteltigo?.fee || 1}
                              onChange={(e) => {
                                setSettings(prev => ({
                                  ...prev,
                                  paymentGateway: {
                                    ...prev.paymentGateway,
                                    momo: {
                                      ...prev.paymentGateway?.momo,
                                      providers: {
                                        ...prev.paymentGateway?.momo?.providers,
                                        airteltigo: {
                                          ...prev.paymentGateway?.momo?.providers?.airteltigo,
                                          fee: parseFloat(e.target.value)
                                        }
                                      }
                                    }
                                  }
                                }));
                                setHasChanges(true);
                              }}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                              min="0"
                              max="10"
                              step="0.1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </SettingCard>

              <SettingCard
                title="Wallet Payment"
                description="Configure wallet payment settings"
                icon={Wallet}
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={settings.paymentGateway?.wallet?.enabled || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        paymentGateway: {
                          ...prev.paymentGateway,
                          wallet: {
                            ...prev.paymentGateway?.wallet,
                            enabled: enabled
                          }
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Enable Wallet Payment"
                  />
                  
                  <ToggleSwitch
                    enabled={settings.paymentGateway?.wallet?.instantProcessing || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        paymentGateway: {
                          ...prev.paymentGateway,
                          wallet: {
                            ...prev.paymentGateway?.wallet,
                            instantProcessing: enabled
                          }
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Enable Instant Processing"
                  />
                </div>
              </SettingCard>

              <SettingCard
                title="Payment Retry Settings"
                description="Configure failed payment retry behavior"
                icon={RefreshCw}
              >
                <div className="space-y-4">
                  <ToggleSwitch
                    enabled={settings.paymentGateway?.retryFailedPayments || false}
                    onChange={(enabled) => {
                      setSettings(prev => ({
                        ...prev,
                        paymentGateway: {
                          ...prev.paymentGateway,
                          retryFailedPayments: enabled
                        }
                      }));
                      setHasChanges(true);
                    }}
                    label="Enable Automatic Retry for Failed Payments"
                  />
                  
                  {settings.paymentGateway?.retryFailedPayments && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Max Retry Attempts
                        </label>
                        <input
                          type="number"
                          value={settings.paymentGateway?.maxRetryAttempts || 3}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              paymentGateway: {
                                ...prev.paymentGateway,
                                maxRetryAttempts: parseInt(e.target.value)
                              }
                            }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          min="1"
                          max="10"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Retry Interval (minutes)
                        </label>
                        <input
                          type="number"
                          value={settings.paymentGateway?.retryInterval || 60}
                          onChange={(e) => {
                            setSettings(prev => ({
                              ...prev,
                              paymentGateway: {
                                ...prev.paymentGateway,
                                retryInterval: parseInt(e.target.value)
                              }
                            }));
                            setHasChanges(true);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          min="5"
                          max="1440"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </SettingCard>
            </div>
          )}

          {/* Add placeholders for other tabs - you can expand these later */}
          {activeTab === 'pricing' && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Pricing settings coming soon</p>
            </div>
          )}

          {activeTab === 'stores' && (
            <div className="text-center py-12">
              <Store className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Store settings coming soon</p>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Notification settings coming soon</p>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">API settings coming soon</p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Security settings coming soon</p>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">Maintenance settings coming soon</p>
            </div>
          )}

          {/* Save Button */}
          {hasChanges && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => {
                  const dataToSave = activeTab === 'payment' ? settings.paymentGateway : settings[activeTab];
                  handleSaveSettings(activeTab, dataToSave);
                }}
                disabled={saving}
                className="px-6 py-2 bg-purple-600 dark:bg-purple-700 text-white rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
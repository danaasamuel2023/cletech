// app/dashboard/store/page.js - Complete Agent Store Management with Mobile Money Support
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, Settings, Package, DollarSign, BarChart3, Upload, 
  Save, Plus, Edit2, Trash2, Eye, EyeOff, Clock, MapPin,
  Phone, Mail, Globe, Loader2, Copy,
  Check, X, AlertCircle, TrendingUp, Users, ShoppingBag,
  Wallet, ArrowUpRight, ArrowDownRight, Calendar, Bell,
  ChevronDown, ChevronRight, Image as ImageIcon, Link2,
  CreditCard, Building
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AgentStoreManagement() {
  // ==================== STATE MANAGEMENT ====================
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState(null);
  const [showCreateStore, setShowCreateStore] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [processingMessage, setProcessingMessage] = useState('');

  // Store Creation Form
  const [storeForm, setStoreForm] = useState({
    storeName: '',
    subdomain: '',
    whatsappNumber: '',
    whatsappGroupLink: '',
    description: '',
    contactEmail: '',
    alternativePhone: ''
  });

  // Store Settings Form
  const [settingsForm, setSettingsForm] = useState({
    storeName: '',
    description: '',
    whatsappNumber: '',
    whatsappGroupLink: '',
    contactEmail: '',
    alternativePhone: '',
    businessHours: {
      monday: { open: '08:00', close: '20:00', closed: false },
      tuesday: { open: '08:00', close: '20:00', closed: false },
      wednesday: { open: '08:00', close: '20:00', closed: false },
      thursday: { open: '08:00', close: '20:00', closed: false },
      friday: { open: '08:00', close: '20:00', closed: false },
      saturday: { open: '09:00', close: '18:00', closed: false },
      sunday: { open: '10:00', close: '16:00', closed: false }
    },
    location: {
      address: '',
      city: '',
      region: ''
    },
    settings: {
      showPrices: true,
      allowBulkOrders: true,
      minimumOrder: 1
    }
  });

  // Pricing Management
  const [pricingForm, setPricingForm] = useState({
    network: '',
    capacity: '',
    price: ''
  });
  const [customPricing, setCustomPricing] = useState([]);
  const [systemPricing, setSystemPricing] = useState([]);
  const [showPricingModal, setShowPricingModal] = useState(false);

  // Analytics Data
  const [analytics, setAnalytics] = useState({
    today: { sales: 0, revenue: 0, profit: 0 },
    week: { sales: 0, revenue: 0, profit: 0 },
    month: { sales: 0, revenue: 0, profit: 0 },
    topProducts: [],
    customerMetrics: { total: 0, new: 0, repeat: 0, repeatRate: 0 },
    salesChart: [],
    summary: { totalSales: 0, totalRevenue: 0, totalProfit: 0 }
  });

  // Profit Data
  const [profits, setProfits] = useState([]);
  const [profitSummary, setProfitSummary] = useState({
    totalProfit: 0,
    pendingProfit: 0,
    creditedProfit: 0,
    withdrawnProfit: 0
  });

  // Payment Method States (Updated for Mobile Money)
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [paymentMethodType, setPaymentMethodType] = useState('momo'); // 'bank' or 'momo'
  const [withdrawalHistory, setWithdrawalHistory] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loadingBanks, setLoadingBanks] = useState(false);
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  
  // Bank Form
  const [bankForm, setBankForm] = useState({
    accountNumber: '',
    bankCode: '',
    accountName: ''
  });
  
  // Mobile Money Form
  const [momoForm, setMomoForm] = useState({
    momoNumber: '',
    momoNetwork: 'mtn',
    momoName: ''
  });
  const [validatingMomo, setValidatingMomo] = useState(false);
  const [momoValidated, setMomoValidated] = useState(false);
  
  // Withdrawal Form
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    reason: 'Agent profit withdrawal',
    useSavedAccount: true
  });

  // File Upload States
  const [logoFile, setLogoFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Network Options
  const networks = [
    { id: 'MTN', name: 'MTN', color: '#FFCB05' },
    { id: 'TELECEL', name: 'Telecel', color: '#E30613' },
    { id: 'AT', name: 'AirtelTigo', color: '#0066CC' },
    { id: 'YELLO', name: 'Yello', color: '#FF6B35' }
  ];

  // Capacity Options
  const capacities = [
    0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30, 40, 50, 100
  ];

  // ==================== HELPER FUNCTIONS ====================
  const removeDuplicates = (array, generateKey) => {
    const seen = new Set();
    return array.filter(item => {
      const key = generateKey ? generateKey(item) : (item._id || item.id || JSON.stringify(item));
      if (seen.has(key)) {
        console.warn('Duplicate found and removed:', key);
        return false;
      }
      seen.add(key);
      return true;
    });
  };

  const generateUniqueKey = (item, prefix = '') => {
    if (item._id) return item._id;
    if (item.id) return item.id;
    if (item.reference) return item.reference;
    return `${prefix}-${item.network || ''}-${item.capacity || ''}-${item.createdAt || Date.now()}-${Math.random()}`;
  };

  const copyToClipboard = async (text, message = 'Copied to clipboard!') => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess(message);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) {
      setError('Failed to copy to clipboard');
      setTimeout(() => setError(''), 2000);
    }
  };

  // ==================== MOBILE MONEY VALIDATION ====================
  const validateMoMo = async () => {
    if (!momoForm.momoNumber || !momoForm.momoNetwork) {
      setError('Please enter mobile money number and select network');
      return;
    }

    // Validate phone format
    const phoneRegex = /^(\+233|0)[235]\d{8}$/;
    if (!phoneRegex.test(momoForm.momoNumber)) {
      setError('Invalid Ghana mobile money number format');
      return;
    }

    setValidatingMomo(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/validate-momo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: momoForm.momoNumber,
          network: momoForm.momoNetwork
        })
      });

      const data = await response.json();

      if (data.success) {
        setMomoValidated(true);
        if (data.data.accountName) {
          setMomoForm({
            ...momoForm,
            momoName: data.data.accountName
          });
          setSuccess('Mobile money account validated successfully!');
        } else if (data.data.requiresManualName) {
          setSuccess('Phone number validated. Please enter your registered name.');
        }
      } else {
        setError(data.message || 'Failed to validate mobile money account');
        setMomoValidated(false);
      }
    } catch (error) {
      console.error('MoMo validation error:', error);
      setError('Failed to validate mobile money account');
      setMomoValidated(false);
    } finally {
      setValidatingMomo(false);
    }
  };

  // ==================== AUTO-CLEAR MESSAGES ====================
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ==================== INITIAL DATA LOAD ====================
  useEffect(() => {
    const cleanupData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://api.cletech.shop/api/store/cleanup-pricing', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Data cleanup completed:', data.message);
        }
      } catch (error) {
        console.log('Cleanup not necessary or failed:', error);
      }
    };
    
    cleanupData();
    fetchStoreData();
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'profits') {
      fetchProfits();
      fetchPaymentMethod();
      fetchWithdrawalHistory();
    }
  }, [activeTab]);

  // ==================== API FUNCTIONS ====================
  const fetchStoreData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/my-store', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setStore(data.data);
        setSettingsForm({
          ...data.data,
          businessHours: data.data.businessHours || settingsForm.businessHours,
          location: data.data.location || { address: '', city: '', region: '' },
          settings: data.data.settings || settingsForm.settings
        });
        
        const cleanPricing = removeDuplicates(
          data.data.customPricing || [], 
          (item) => `${item.network}-${item.capacity}`
        ).map((price, index) => ({
          ...price,
          uniqueId: price._id || `${price.network}-${price.capacity}-${index}`
        }));
        
        setCustomPricing(cleanPricing);
        setShowCreateStore(false);
      } else if (response.status === 404) {
        setShowCreateStore(true);
      }
    } catch (error) {
      console.error('Error fetching store:', error);
      setShowCreateStore(true);
    } finally {
      setLoading(false);
    }
  };

  const createStore = async () => {
    setSaving(true);
    setError('');
    setSuccess('');
    setProcessingMessage('Validating store information...');

    await new Promise(resolve => setTimeout(resolve, 100));

    const whatsappGroupRegex = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/;
    if (!whatsappGroupRegex.test(storeForm.whatsappGroupLink)) {
      setError('Please enter a valid WhatsApp group invite link');
      setSaving(false);
      setProcessingMessage('');
      return;
    }

    const phoneRegex = /^(\+233|0)[2-9]\d{8}$/;
    if (!phoneRegex.test(storeForm.whatsappNumber)) {
      setError('Please enter a valid Ghana phone number');
      setSaving(false);
      setProcessingMessage('');
      return;
    }

    setProcessingMessage('Creating your store...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(storeForm)
      });

      setProcessingMessage('Setting up your store...');
      const data = await response.json();

      if (data.success) {
        setProcessingMessage('Store created! Redirecting...');
        setSuccess('Store created successfully! WhatsApp group link added.');
        setStore(data.data);
        
        setStoreForm({
          storeName: '',
          subdomain: '',
          whatsappNumber: '',
          whatsappGroupLink: '',
          description: '',
          contactEmail: '',
          alternativePhone: ''
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        setShowCreateStore(false);
        fetchStoreData();
        
        setTimeout(() => {
          setActiveTab('overview');
          setSuccess('');
          setProcessingMessage('');
        }, 2000);
      } else {
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors.map(err => err.message).join(', ');
          setError(errorMessages);
        } else {
          setError(data.message || 'Failed to create store');
        }
        setProcessingMessage('');
      }
    } catch (error) {
      console.error('Error creating store:', error);
      setError('Failed to create store. Please check your connection and try again.');
      setProcessingMessage('');
    } finally {
      setSaving(false);
      setTimeout(() => setProcessingMessage(''), 3000);
    }
  };

  const updateSettings = async () => {
    if (settingsForm.whatsappGroupLink) {
      const whatsappGroupRegex = /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/;
      if (!whatsappGroupRegex.test(settingsForm.whatsappGroupLink)) {
        setError('Please enter a valid WhatsApp group invite link');
        return;
      }
    }

    if (settingsForm.whatsappNumber) {
      const phoneRegex = /^(\+233|0)[2-9]\d{8}$/;
      if (!phoneRegex.test(settingsForm.whatsappNumber)) {
        setError('Please enter a valid Ghana phone number');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/settings', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settingsForm)
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Settings updated successfully!');
        setStore(data.data);
      } else {
        setError(data.message || 'Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setError('Failed to update settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const uploadImages = async () => {
    if (!logoFile && !bannerFile) {
      setError('Please select at least one image to upload');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      if (logoFile) formData.append('logo', logoFile);
      if (bannerFile) formData.append('banner', bannerFile);

      const response = await fetch('https://api.cletech.shop/api/store/upload-images', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Images uploaded successfully!');
        setLogoFile(null);
        setBannerFile(null);
        fetchStoreData();
      } else {
        setError(data.message || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addPricing = async () => {
    if (!pricingForm.network || !pricingForm.capacity || !pricingForm.price) {
      setError('Please fill all pricing fields');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/pricing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          network: pricingForm.network,
          capacity: parseFloat(pricingForm.capacity),
          price: parseFloat(pricingForm.price)
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Pricing added successfully!');
        setPricingForm({ network: '', capacity: '', price: '' });
        setShowPricingModal(false);
        fetchStoreData();
      } else {
        setError(data.message || 'Failed to add pricing');
      }
    } catch (error) {
      console.error('Error adding pricing:', error);
      setError('Failed to add pricing. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePricing = async (network, capacity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.cletech.shop/api/store/pricing/${network}/${capacity}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        fetchStoreData();
      } else {
        setError(data.message || 'Failed to toggle pricing');
      }
    } catch (error) {
      console.error('Error toggling pricing:', error);
      setError('Failed to toggle pricing status');
    }
  };

  const toggleStoreStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/toggle-status', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          isOpen: !store?.operatingStatus?.isOpen,
          reason: store?.operatingStatus?.isOpen ? 'Temporarily closed by owner' : null
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        fetchStoreData();
      } else {
        setError(data.message || 'Failed to toggle store status');
      }
    } catch (error) {
      console.error('Error toggling store status:', error);
      setError('Failed to toggle store status');
    }
  };

  const fetchAnalytics = async (period = '7days') => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.cletech.shop/api/store/analytics?period=${period}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setAnalytics(data.data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchProfits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/profits', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        const cleanProfits = (data.data.profits || []).map((profit, index) => ({
          ...profit,
          uniqueId: profit._id || profit.id || `profit-${index}-${Date.now()}`
        }));
        
        const uniqueProfits = removeDuplicates(cleanProfits, item => item.uniqueId);
        
        setProfits(uniqueProfits);
        setProfitSummary(data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching profits:', error);
    }
  };

  // Fetch Payment Method (Updated)
  const fetchPaymentMethod = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/bank-account', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setPaymentMethod(data.data);
      }
    } catch (error) {
      console.error('Error fetching payment method:', error);
    }
  };

  const fetchBanks = async () => {
    setLoadingBanks(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/banks', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setBanks(data.data);
      }
    } catch (error) {
      console.error('Error fetching banks:', error);
      setError('Failed to fetch banks list');
    } finally {
      setLoadingBanks(false);
    }
  };

  const fetchWithdrawalHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/withdrawals', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      if (data.success) {
        const cleanWithdrawals = (data.data || []).map((withdrawal, index) => ({
          ...withdrawal,
          uniqueId: withdrawal._id || withdrawal.reference || `withdrawal-${index}-${Date.now()}`
        }));
        
        setWithdrawalHistory(removeDuplicates(cleanWithdrawals, item => item.uniqueId));
      }
    } catch (error) {
      console.error('Error fetching withdrawal history:', error);
    }
  };

  // Add Payment Method (Updated for Mobile Money)
  const addPaymentMethod = async () => {
    setSaving(true);
    setError('');
    setProcessingMessage('Adding payment method...');

    try {
      const token = localStorage.getItem('token');

      if (paymentMethodType === 'bank') {
        if (!bankForm.accountNumber || !bankForm.bankCode) {
          setError('Please fill all bank account fields');
          setSaving(false);
          setProcessingMessage('');
          return;
        }

        const response = await fetch('https://api.cletech.shop/api/store/bank-account', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bankForm)
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('Bank account added successfully!');
          setBankForm({ accountNumber: '', bankCode: '', accountName: '' });
          setShowPaymentMethodModal(false);
          fetchPaymentMethod();
        } else {
          setError(data.message || 'Failed to add bank account');
        }
      } else {
        // Mobile money
        if (!momoForm.momoNumber || !momoForm.momoNetwork || !momoForm.momoName) {
          setError('Please complete all mobile money fields');
          setSaving(false);
          setProcessingMessage('');
          return;
        }

        if (!momoValidated) {
          setError('Please validate your mobile money number first');
          setSaving(false);
          setProcessingMessage('');
          return;
        }

        // Save mobile money as bank account with special handling
        const response = await fetch('https://api.cletech.shop/api/store/bank-account', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accountNumber: momoForm.momoNumber,
            bankCode: momoForm.momoNetwork === 'mtn' ? 'MTN' : 
                       momoForm.momoNetwork === 'vodafone' ? 'VOD' :
                       momoForm.momoNetwork === 'telecel' ? 'VOD' : 'ATL',
            accountName: momoForm.momoName,
            isMomo: true,
            momoNetwork: momoForm.momoNetwork
          })
        });

        const data = await response.json();

        if (data.success) {
          setSuccess('Mobile money account added successfully!');
          setMomoForm({ momoNumber: '', momoNetwork: 'mtn', momoName: '' });
          setMomoValidated(false);
          setShowPaymentMethodModal(false);
          fetchPaymentMethod();
        } else {
          setError(data.message || 'Failed to add mobile money account');
        }
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
      setError('Failed to add payment method. Please try again.');
    } finally {
      setSaving(false);
      setProcessingMessage('');
    }
  };

  const processWithdrawal = async () => {
    const amount = parseFloat(withdrawForm.amount);
    
    if (!amount || amount < 10) {
      setError('Minimum withdrawal amount is GH₵ 10');
      return;
    }

    if (amount > profitSummary.creditedProfit) {
      setError('Insufficient available balance');
      return;
    }

    if (!paymentMethod && withdrawForm.useSavedAccount) {
      setError('Please add a payment method first');
      setShowPaymentMethodModal(true);
      return;
    }

    setProcessingWithdrawal(true);
    setError('');
    setProcessingMessage('Processing withdrawal...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://api.cletech.shop/api/store/withdraw-profit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount,
          reason: withdrawForm.reason,
          useSavedAccount: withdrawForm.useSavedAccount
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setWithdrawForm({ amount: '', reason: 'Agent profit withdrawal', useSavedAccount: true });
        setShowWithdrawModal(false);
        fetchProfits();
        fetchWithdrawalHistory();
        fetchStoreData();
        
        if (data.data.status === 'pending') {
          setProcessingMessage('Your withdrawal is being processed and will be completed shortly');
          setTimeout(() => setProcessingMessage(''), 5000);
        }
      } else {
        setError(data.message || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      setError('Failed to process withdrawal. Please try again.');
    } finally {
      setProcessingWithdrawal(false);
      setProcessingMessage('');
    }
  };

  // ==================== RENDER FUNCTIONS ====================
  const renderCreateStore = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 relative ${saving ? 'opacity-75' : ''}`}>
        {saving && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {processingMessage || 'Creating your store...'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Please wait...</p>
            </div>
          </div>
        )}

        <div className="flex items-center mb-6">
          <Store className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create Your Store
          </h2>
        </div>

        <div className="space-y-4">
          {error && !saving && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          
          {success && !saving && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start">
              <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Store Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={storeForm.storeName}
                onChange={(e) => setStoreForm({...storeForm, storeName: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                  storeForm.storeName 
                    ? 'border-green-500 focus:ring-green-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                }`}
                placeholder="Enter your store name"
                disabled={saving}
              />
              {storeForm.storeName && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Store URL (Subdomain) <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-r-0 border-gray-300 dark:border-gray-600 rounded-l-lg text-gray-600 dark:text-gray-400">
                datastore.com/
              </span>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={storeForm.subdomain}
                  onChange={(e) => setStoreForm({...storeForm, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                  className={`w-full px-4 py-2 border rounded-r-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                    storeForm.subdomain && storeForm.subdomain.length >= 3
                      ? 'border-green-500 focus:ring-green-500' 
                      : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                  }`}
                  placeholder="yourstore"
                  disabled={saving}
                />
                {storeForm.subdomain && storeForm.subdomain.length >= 3 && (
                  <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                )}
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Only lowercase letters, numbers, and hyphens allowed (min. 3 characters)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={storeForm.whatsappNumber}
                onChange={(e) => setStoreForm({...storeForm, whatsappNumber: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                  /^(\+233|0)[2-9]\d{8}$/.test(storeForm.whatsappNumber)
                    ? 'border-green-500 focus:ring-green-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                }`}
                placeholder="0241234567"
                disabled={saving}
              />
              {/^(\+233|0)[2-9]\d{8}$/.test(storeForm.whatsappNumber) && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              WhatsApp Group Link <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="url"
                value={storeForm.whatsappGroupLink}
                onChange={(e) => setStoreForm({...storeForm, whatsappGroupLink: e.target.value})}
                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                  /^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/.test(storeForm.whatsappGroupLink)
                    ? 'border-green-500 focus:ring-green-500' 
                    : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500'
                }`}
                placeholder="https://chat.whatsapp.com/..."
                disabled={saving}
              />
              {/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/.test(storeForm.whatsappGroupLink) && (
                <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Enter your WhatsApp group invite link for customers
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Store Description
            </label>
            <textarea
              value={storeForm.description}
              onChange={(e) => setStoreForm({...storeForm, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              rows="3"
              placeholder="Tell customers about your store..."
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={storeForm.contactEmail}
                onChange={(e) => setStoreForm({...storeForm, contactEmail: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="store@example.com"
                disabled={saving}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alternative Phone
              </label>
              <input
                type="tel"
                value={storeForm.alternativePhone}
                onChange={(e) => setStoreForm({...storeForm, alternativePhone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="0501234567"
                disabled={saving}
              />
            </div>
          </div>

          <button
            onClick={createStore}
            disabled={saving || !storeForm.storeName || !storeForm.subdomain || !storeForm.whatsappNumber || !storeForm.whatsappGroupLink}
            className={`w-full px-6 py-3 font-medium rounded-lg transition-all duration-200 flex items-center justify-center ${
              saving 
                ? 'bg-blue-400 text-white cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg'
            }`}
          >
            {saving ? (
              <div className="flex items-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="animate-pulse">Creating Store...</span>
              </div>
            ) : (
              <>
                <Plus className="w-5 h-5 mr-2" />
                Create Store
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Store Status</h3>
          <button
            onClick={toggleStoreStatus}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              store?.operatingStatus?.isOpen
                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                : 'bg-red-100 text-red-700 hover:bg-red-200'
            }`}
          >
            {store?.operatingStatus?.isOpen ? 'Store Open' : 'Store Closed'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Store URL</p>
            <a
              href={`http://datastore.com/${store?.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline flex items-center"
            >
              datastore.com/{store?.subdomain}
              <Link2 className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">WhatsApp Group</p>
            <a
              href={store?.whatsappGroupLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline flex items-center"
            >
              Join Group
              <Link2 className="w-4 h-4 ml-1" />
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {customPricing.filter(p => p.isActive).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {store?.statistics?.totalSales || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profit Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              GH₵ {store?.profitStats?.today?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              GH₵ {store?.profitStats?.week?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              GH₵ {store?.profitStats?.month?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
            <p className="text-2xl font-bold text-green-600">
              GH₵ {store?.profitStats?.total?.toFixed(2) || '0.00'}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp Number</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{store?.whatsappNumber}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Link2 className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">WhatsApp Group</p>
              <div className="flex items-center gap-2">
                <a
                  href={store?.whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-green-600 hover:text-green-700 hover:underline"
                >
                  Join Customer Group
                </a>
                <button
                  onClick={() => copyToClipboard(store?.whatsappGroupLink, 'WhatsApp group link copied!')}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  title="Copy link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          {store?.contactEmail && (
            <div className="flex items-start space-x-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{store.contactEmail}</p>
              </div>
            </div>
          )}
          {store?.alternativePhone && (
            <div className="flex items-start space-x-3">
              <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Alternative Phone</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{store.alternativePhone}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => setActiveTab('settings')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex items-center justify-between"
        >
          <div className="flex items-center">
            <Settings className="w-8 h-8 text-blue-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Store Settings</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage store info</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex items-center justify-between"
        >
          <div className="flex items-center">
            <Package className="w-8 h-8 text-green-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Pricing</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Set your prices</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow flex items-center justify-between"
        >
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-600 mr-3" />
            <div className="text-left">
              <p className="font-medium text-gray-900 dark:text-white">Analytics</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">View insights</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Store Images</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Store Logo
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              {store?.logo ? (
                <img src={store.logo} alt="Store Logo" className="w-32 h-32 object-cover mx-auto rounded-lg" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="mt-4 block text-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors"
              >
                Choose Logo
              </label>
              {logoFile && (
                <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                  Selected: {logoFile.name}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Store Banner
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
              {store?.bannerImage ? (
                <img src={store.bannerImage} alt="Store Banner" className="w-full h-32 object-cover rounded-lg" />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])}
                className="hidden"
                id="banner-upload"
              />
              <label
                htmlFor="banner-upload"
                className="mt-4 block text-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer transition-colors"
              >
                Choose Banner
              </label>
              {bannerFile && (
                <p className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
                  Selected: {bannerFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {(logoFile || bannerFile) && (
          <button
            onClick={uploadImages}
            disabled={saving}
            className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload Images
              </>
            )}
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Store Name
            </label>
            <input
              type="text"
              value={settingsForm.storeName}
              onChange={(e) => setSettingsForm({...settingsForm, storeName: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={settingsForm.description}
              onChange={(e) => setSettingsForm({...settingsForm, description: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={settingsForm.whatsappNumber}
                onChange={(e) => setSettingsForm({...settingsForm, whatsappNumber: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                WhatsApp Group Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={settingsForm.whatsappGroupLink}
                onChange={(e) => setSettingsForm({...settingsForm, whatsappGroupLink: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://chat.whatsapp.com/..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Essential for customer communication and community building
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Contact Email
              </label>
              <input
                type="email"
                value={settingsForm.contactEmail}
                onChange={(e) => setSettingsForm({...settingsForm, contactEmail: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alternative Phone
              </label>
              <input
                type="tel"
                value={settingsForm.alternativePhone}
                onChange={(e) => setSettingsForm({...settingsForm, alternativePhone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Store Settings</h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Show Prices</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Display prices to customers</p>
            </div>
            <input
              type="checkbox"
              checked={settingsForm.settings?.showPrices}
              onChange={(e) => setSettingsForm({
                ...settingsForm,
                settings: {...settingsForm.settings, showPrices: e.target.checked}
              })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">Allow Bulk Orders</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Accept bulk purchase requests</p>
            </div>
            <input
              type="checkbox"
              checked={settingsForm.settings?.allowBulkOrders}
              onChange={(e) => setSettingsForm({
                ...settingsForm,
                settings: {...settingsForm.settings, allowBulkOrders: e.target.checked}
              })}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Order Quantity
            </label>
            <input
              type="number"
              value={settingsForm.settings?.minimumOrder || 1}
              onChange={(e) => setSettingsForm({
                ...settingsForm,
                settings: {...settingsForm.settings, minimumOrder: parseInt(e.target.value)}
              })}
              min="1"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <button
        onClick={updateSettings}
        disabled={saving}
        className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Saving Settings...
          </>
        ) : (
          <>
            <Save className="w-5 h-5 mr-2" />
            Save Settings
          </>
        )}
      </button>
    </div>
  );

  const renderPricing = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Product Pricing</h3>
        <button
          onClick={() => setShowPricingModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Pricing
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Network
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  System Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Your Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {customPricing.map((pricing, index) => {
                const network = networks.find(n => n.id === pricing.network);
                const uniqueKey = pricing.uniqueId || pricing._id || `${pricing.network}-${pricing.capacity}-${index}`;
                
                return (
                  <tr key={uniqueKey}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="px-2 py-1 text-xs font-medium rounded"
                        style={{
                          backgroundColor: network?.color + '20',
                          color: network?.color
                        }}
                      >
                        {pricing.network}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {pricing.capacity}GB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      GH₵ {pricing.systemPrice?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      GH₵ {pricing.agentPrice?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      GH₵ {pricing.profit?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        pricing.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {pricing.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => togglePricing(pricing.network, pricing.capacity)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        {pricing.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {customPricing.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No pricing configured yet. Add your first pricing to get started.
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPricingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowPricingModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Product Pricing
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Network
                  </label>
                  <select
                    value={pricingForm.network}
                    onChange={(e) => setPricingForm({...pricingForm, network: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Network</option>
                    {networks.map(network => (
                      <option key={network.id} value={network.id}>
                        {network.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capacity (GB)
                  </label>
                  <select
                    value={pricingForm.capacity}
                    onChange={(e) => setPricingForm({...pricingForm, capacity: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Capacity</option>
                    {capacities.map(capacity => (
                      <option key={capacity} value={capacity}>
                        {capacity}GB
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Your Price (GH₵)
                  </label>
                  <input
                    type="number"
                    value={pricingForm.price}
                    onChange={(e) => setPricingForm({...pricingForm, price: e.target.value})}
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addPricing}
                  disabled={saving || !pricingForm.network || !pricingForm.capacity || !pricingForm.price}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Adding...
                    </>
                  ) : (
                    'Add Pricing'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Store Analytics</h3>
        <select
          onChange={(e) => fetchAnalytics(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Sales</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics.summary?.totalSales || 0}
              </p>
            </div>
            <ShoppingBag className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                GH₵ {analytics.summary?.totalRevenue?.toFixed(2) || '0.00'}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
              <p className="text-2xl font-bold text-green-600">
                GH₵ {analytics.summary?.totalProfit?.toFixed(2) || '0.00'}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Customer Metrics</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Customers</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {analytics.customerMetrics?.total || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">New Customers</p>
            <p className="text-xl font-bold text-blue-600">
              {analytics.customerMetrics?.new || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Repeat Customers</p>
            <p className="text-xl font-bold text-green-600">
              {analytics.customerMetrics?.repeat || 0}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Repeat Rate</p>
            <p className="text-xl font-bold text-purple-600">
              {analytics.customerMetrics?.repeatRate || 0}%
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">Top Products</h4>
        <div className="space-y-3">
          {analytics.topProducts?.map((product, index) => {
            const uniqueKey = `${product._id?.network || 'unknown'}-${product._id?.capacity || 'unknown'}-${index}`;
            
            return (
              <div key={uniqueKey} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm mr-3">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product._id?.network} {product._id?.capacity}GB
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {product.count} sales
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">
                    GH₵ {product.revenue?.toFixed(2)}
                  </p>
                  <p className="text-sm text-green-600">
                    +GH₵ {product.profit?.toFixed(2)} profit
                  </p>
                </div>
              </div>
            );
          })}
          {(!analytics.topProducts || analytics.topProducts.length === 0) && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No sales data available for this period
            </p>
          )}
        </div>
      </div>
    </div>
  );

  const renderProfits = () => (
    <div className="space-y-6">
      {/* Payment Method Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Method</h3>
          {!paymentMethod && (
            <button
              onClick={() => {
                setShowPaymentMethodModal(true);
                setPaymentMethodType('momo');
                setMomoValidated(false);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </button>
          )}
        </div>
        
        {paymentMethod ? (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                {paymentMethod.isMomo ? (
                  <>
                    <div className="flex items-center mb-2">
                      <Phone className="w-5 h-5 text-green-600 mr-2" />
                      <p className="font-medium text-gray-900 dark:text-white">Mobile Money</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {paymentMethod.accountName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Number: {paymentMethod.accountNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Network: {paymentMethod.momoNetwork?.toUpperCase() || paymentMethod.bankCode}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center mb-2">
                      <Building className="w-5 h-5 text-blue-600 mr-2" />
                      <p className="font-medium text-gray-900 dark:text-white">Bank Account</p>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {paymentMethod.accountName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Account: {paymentMethod.accountNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Bank Code: {paymentMethod.bankCode}
                    </p>
                  </>
                )}
              </div>
              {paymentMethod.isVerified && (
                <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                  Verified
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setShowPaymentMethodModal(true);
                setPaymentMethodType('momo');
                setMomoValidated(false);
              }}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700"
            >
              Change Payment Method
            </button>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <Wallet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No payment method added</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              Add a payment method to withdraw your profits
            </p>
          </div>
        )}
      </div>

      {/* Profit Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profit Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Profit</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              GH₵ {profitSummary.totalProfit?.toFixed(2)}
            </p>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              GH₵ {profitSummary.pendingProfit?.toFixed(2)}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
            <p className="text-2xl font-bold text-green-600">
              GH₵ {profitSummary.creditedProfit?.toFixed(2)}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Withdrawn</p>
            <p className="text-2xl font-bold text-blue-600">
              GH₵ {profitSummary.withdrawnProfit?.toFixed(2)}
            </p>
          </div>
        </div>

        {profitSummary.creditedProfit >= 10 && (
          <button
            onClick={() => setShowWithdrawModal(true)}
            className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Withdraw to {paymentMethod?.isMomo ? 'Mobile Money' : 'Bank'}
          </button>
        )}
        
        {profitSummary.creditedProfit > 0 && profitSummary.creditedProfit < 10 && (
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Minimum withdrawal amount is GH₵ 10. Current available: GH₵ {profitSummary.creditedProfit?.toFixed(2)}
          </p>
        )}
      </div>

      {/* Withdrawal History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">Withdrawal History</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Method
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {withdrawalHistory.map((withdrawal, index) => {
                const uniqueKey = withdrawal.uniqueId || generateUniqueKey(withdrawal, 'withdrawal');
                
                return (
                  <tr key={uniqueKey}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      {withdrawal.reference?.slice(-8) || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      GH₵ {withdrawal.amount?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        withdrawal.status === 'completed'
                          ? 'bg-green-100 text-green-700'
                          : withdrawal.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : withdrawal.status === 'processing'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {withdrawal.withdrawalDetails?.isMomo ? 'Mobile Money' : 'Bank Transfer'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {withdrawalHistory.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No withdrawal history
            </div>
          )}
        </div>
      </div>

      {/* Profit History */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-gray-900 dark:text-white">Profit History</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {profits.map((profit, index) => {
                const uniqueKey = profit.uniqueId || generateUniqueKey(profit, 'profit');
                
                return (
                  <tr key={uniqueKey}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {new Date(profit.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {profit.network} {profit.capacity}GB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                      {profit.purchaseId?.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                      GH₵ {profit.profit?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        profit.status === 'credited'
                          ? 'bg-green-100 text-green-700'
                          : profit.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {profit.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {profits.length === 0 && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No profit records found
            </div>
          )}
        </div>
      </div>

      {/* Payment Method Modal */}
      <AnimatePresence>
        {showPaymentMethodModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowPaymentMethodModal(false);
              setMomoValidated(false);
              setError('');
            }}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Add Payment Method
              </h3>

              {/* Payment Method Type Selection */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => {
                    setPaymentMethodType('momo');
                    setMomoValidated(false);
                    setError('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                    paymentMethodType === 'momo'
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Mobile Money
                </button>
                <button
                  onClick={() => {
                    setPaymentMethodType('bank');
                    fetchBanks();
                    setError('');
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                    paymentMethodType === 'bank'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Bank Account
                </button>
              </div>

              <div className="space-y-4">
                {paymentMethodType === 'momo' ? (
                  <>
                    {/* Mobile Money Form */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mobile Network
                      </label>
                      <select
                        value={momoForm.momoNetwork}
                        onChange={(e) => {
                          setMomoForm({...momoForm, momoNetwork: e.target.value});
                          setMomoValidated(false);
                          setError('');
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                      >
                        <option value="mtn">MTN Mobile Money</option>
                        <option value="vodafone">Telecel Cash (Vodafone)</option>
                        <option value="airteltigo">AirtelTigo Money</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Mobile Money Number
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="tel"
                            value={momoForm.momoNumber}
                            onChange={(e) => {
                              setMomoForm({...momoForm, momoNumber: e.target.value});
                              setMomoValidated(false);
                              setError('');
                            }}
                            className={`w-full px-4 py-2 pr-10 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                              momoValidated 
                                ? 'border-green-500 focus:ring-green-500' 
                                : 'border-gray-300 dark:border-gray-600 focus:ring-green-500'
                            }`}
                            placeholder="0241234567"
                            disabled={validatingMomo}
                          />
                          {momoValidated && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                          )}
                        </div>
                        <button
                          onClick={validateMoMo}
                          disabled={validatingMomo || !momoForm.momoNumber || momoValidated}
                          className={`px-4 py-2 font-medium rounded-lg transition-all duration-200 flex items-center ${
                            momoValidated 
                              ? 'bg-green-100 text-green-700 cursor-default'
                              : 'bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 disabled:cursor-not-allowed'
                          }`}
                        >
                          {validatingMomo ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : momoValidated ? (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Validated
                            </>
                          ) : (
                            'Validate'
                          )}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Enter the phone number registered with your mobile money account
                      </p>
                    </div>

                    {momoValidated && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Account Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={momoForm.momoName}
                          onChange={(e) => setMomoForm({...momoForm, momoName: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                          placeholder="Enter your registered name"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          Enter the exact name registered with your mobile money account
                        </p>
                      </motion.div>
                    )}

                    {momoValidated && (
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                        <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                          <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                          Phone number validated. Please enter your account name to continue.
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-800 dark:text-amber-400">
                            Important Information
                          </p>
                          <ul className="mt-1 text-xs text-amber-700 dark:text-amber-300 space-y-1">
                            <li>• Use your registered mobile money number</li>
                            <li>• Ensure the name matches your MoMo account</li>
                            <li>• Withdrawals are usually instant (1-5 minutes)</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Bank Account Form */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Bank
                      </label>
                      <select
                        value={bankForm.bankCode}
                        onChange={(e) => setBankForm({...bankForm, bankCode: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        disabled={loadingBanks}
                      >
                        <option value="">Select a bank</option>
                        {banks.map((bank, index) => (
                          <option key={`${bank.code}-${bank.id || index}`} value={bank.code}>
                            {bank.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={bankForm.accountNumber}
                        onChange={(e) => setBankForm({...bankForm, accountNumber: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                        placeholder="Enter account number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Account Name
                      </label>
                      <input
                        type="text"
                        value={bankForm.accountName}
                        onChange={(e) => setBankForm({...bankForm, accountName: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                        placeholder="Will be verified automatically"
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Account name will be fetched from the bank
                      </p>
                    </div>

                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-start">
                        <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-800 dark:text-blue-400">
                            Bank Transfer Information
                          </p>
                          <ul className="mt-1 text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Account name will be verified automatically</li>
                            <li>• Transfers typically take 1-3 hours</li>
                            <li>• Ensure account details are correct</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <p className="text-sm text-red-600 dark:text-red-400 flex items-start">
                      <X className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
                      {error}
                    </p>
                  </motion.div>
                )}

                {processingMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                  >
                    <p className="text-sm text-blue-600 dark:text-blue-400 flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      {processingMessage}
                    </p>
                  </motion.div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    setShowPaymentMethodModal(false);
                    setMomoValidated(false);
                    setError('');
                    setProcessingMessage('');
                  }}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={addPaymentMethod}
                  disabled={
                    saving || 
                    (paymentMethodType === 'momo' && (!momoValidated || !momoForm.momoName)) ||
                    (paymentMethodType === 'bank' && (!bankForm.bankCode || !bankForm.accountNumber))
                  }
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500 flex items-center justify-center shadow-lg"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {paymentMethodType === 'momo' ? <Phone className="w-4 h-4 mr-2" /> : <Building className="w-4 h-4 mr-2" />}
                      Add {paymentMethodType === 'momo' ? 'Mobile Money' : 'Bank Account'}
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdrawal Modal */}
      <AnimatePresence>
        {showWithdrawModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowWithdrawModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Withdraw Profits
              </h3>

              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    GH₵ {profitSummary.creditedProfit?.toFixed(2)}
                  </p>
                </div>

                {paymentMethod && (
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Withdraw To:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {paymentMethod.accountName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {paymentMethod.accountNumber} • {paymentMethod.isMomo ? paymentMethod.momoNetwork?.toUpperCase() : paymentMethod.bankCode}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (GH₵)
                  </label>
                  <input
                    type="number"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                    min="10"
                    max={profitSummary.creditedProfit}
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Minimum: GH₵ 10 • Maximum: GH₵ {profitSummary.creditedProfit?.toFixed(2)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={withdrawForm.reason}
                    onChange={(e) => setWithdrawForm({...withdrawForm, reason: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Withdrawal reason"
                  />
                </div>

                {processingMessage && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">{processingMessage}</p>
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowWithdrawModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                  disabled={processingWithdrawal}
                >
                  Cancel
                </button>
                <button
                  onClick={processWithdrawal}
                  disabled={processingWithdrawal || !withdrawForm.amount || parseFloat(withdrawForm.amount) < 10}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {processingWithdrawal ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Withdraw
                    </>
                  )}
                </button>
              </div>

              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  {paymentMethod?.isMomo 
                    ? 'Mobile money withdrawals are usually instant (1-5 minutes)'
                    : 'Bank transfers typically take 1-3 hours to complete'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // ==================== MAIN RENDER ====================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (showCreateStore && !store) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          {renderCreateStore()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center"
          >
            <Check className="w-5 h-5 mr-2" />
            {success}
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 py-8">
       <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Store className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {store?.storeName || 'My Store'}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage your store and track performance
                </p>
                {store?.whatsappGroupLink && (
                  <a
                    href={store.whatsappGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-1 text-xs text-green-600 hover:text-green-700"
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    WhatsApp Group
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                store?.operatingStatus?.isOpen
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {store?.operatingStatus?.isOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-2 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Store },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'pricing', label: 'Pricing', icon: Package },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'profits', label: 'Profits', icon: DollarSign }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'settings' && renderSettings()}
            {activeTab === 'pricing' && renderPricing()}
            {activeTab === 'analytics' && renderAnalytics()}
            {activeTab === 'profits' && renderProfits()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
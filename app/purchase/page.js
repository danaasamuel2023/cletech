// app/purchase/page.js - Updated with Network Cards
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Loader2, Phone, CreditCard, Wallet, ChevronDown,
  AlertCircle, Check, Upload, FileSpreadsheet, X,
  Plus, Trash2, Copy, Info, PackagePlus, Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

// Network Card Component
const NetworkCard = ({ network }) => {
  // MTN Logo SVG
  const MTNLogo = () => (
    <svg width="100" height="100" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="#ffcc00" stroke="#000" strokeWidth="2"/>
      <path d="M50 80 L80 140 L100 80 L120 140 L150 80" stroke="#000" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="100" y="170" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="28">MTN</text>
    </svg>
  );

  // Telecel Logo SVG
  const TelecelLogo = () => (
    <svg width="100" height="100" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="#ffffff" stroke="#cc0000" strokeWidth="2"/>
      <text x="100" y="110" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="32" fill="#cc0000">TELECEL</text>
      <path d="M50 125 L150 125" stroke="#cc0000" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  );

  // AirtelTigo Logo SVG
  const AirtelTigoLogo = () => (
    <svg width="100" height="100" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="atGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0066CC', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="85" fill="url(#atGradient)" stroke="#1e40af" strokeWidth="3"/>
      <text x="100" y="110" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="55" fill="white">AT</text>
      <text x="100" y="140" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="20" fill="white">AirtelTigo</text>
    </svg>
  );

  // Yello Logo SVG (similar to MTN but with different branding)
  const YelloLogo = () => (
    <svg width="100" height="100" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="#FF6B35" stroke="#fff" strokeWidth="2"/>
      <text x="100" y="120" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="40" fill="white">YELLO</text>
    </svg>
  );

  const networkConfigs = {
    MTN: {
      logo: <MTNLogo />,
      bgColor: 'bg-yellow-400',
      textColor: 'text-black',
      title: 'MTN Data Bundles',
      subtitle: 'Ghana\'s Everywhere You Go Network',
      features: ['Non-Expiry Bundles Available', 'Instant Delivery', 'Best Coverage Nationwide']
    },
    TELECEL: {
      logo: <TelecelLogo />,
      bgColor: 'bg-gradient-to-br from-red-600 to-red-700',
      textColor: 'text-white',
      title: 'Telecel Premium Bundles',
      subtitle: 'Premium Quality Network',
      features: ['Non-Expiry Options', 'Premium Service', 'Reliable Connection']
    },
    AT: {
      logo: <AirtelTigoLogo />,
      bgColor: 'bg-gradient-to-br from-blue-600 to-purple-600',
      textColor: 'text-white',
      title: 'AirtelTigo Data Bundles',
      subtitle: 'Smart Choice for Smart People',
      features: ['30-Day Validity', 'Affordable Rates', 'Wide Coverage']
    },
    YELLO: {
      logo: <YelloLogo />,
      bgColor: 'bg-gradient-to-br from-orange-500 to-orange-600',
      textColor: 'text-white',
      title: 'Yello Special Bundles',
      subtitle: 'Your Affordable Network Solution',
      features: ['Budget-Friendly', 'Flexible Plans', 'Great Value']
    }
  };

  const config = networkConfigs[network] || networkConfigs.MTN;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`${config.bgColor} ${config.textColor} rounded-lg shadow-xl p-6 mb-6`}
    >
      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Logo Section */}
        <div className="flex-shrink-0">
          {config.logo}
        </div>
        
        {/* Info Section */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold mb-2">{config.title}</h2>
          <p className="text-lg opacity-90 mb-4">{config.subtitle}</p>
          
          {/* Features */}
          <div className="flex flex-wrap gap-3 justify-center md:justify-start">
            {config.features.map((feature, index) => (
              <span 
                key={index}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  network === 'MTN' 
                    ? 'bg-black text-yellow-400' 
                    : 'bg-white/20 backdrop-blur-sm'
                }`}
              >
                ✓ {feature}
              </span>
            ))}
          </div>
        </div>
        
        {/* Stats Section (optional) */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm opacity-80">Support</div>
          </div>
          <div>
            <div className="text-2xl font-bold">Fast</div>
            <div className="text-sm opacity-80">Delivery</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// Main component that uses useSearchParams
function DataPurchaseContent() {
  const searchParams = useSearchParams();
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userBalance, setUserBalance] = useState(0.397);
  const [showExcelUpload, setShowExcelUpload] = useState(false);
  
  // Bulk Purchase States
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInputMethod, setBulkInputMethod] = useState('manual');
  const [bulkManualInput, setBulkManualInput] = useState('');
  const [bulkPurchases, setBulkPurchases] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkTotalCost, setBulkTotalCost] = useState(0);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [bulkFile, setBulkFile] = useState(null);

  const networks = [
    { id: 'MTN', name: 'MTN', color: '#FFCB05' },
    { id: 'TELECEL', name: 'Telecel', color: '#E30613' },
    { id: 'AT', name: 'AirtelTigo', color: '#0066CC' },
    { id: 'YELLO', name: 'Yello', color: '#FF6B35' }
  ];

  const sampleBulkData = `0241234567 2
0551234567 5
0261234567 1
0271234567 10
0581234567 3`;

  useEffect(() => {
    const networkParam = searchParams.get('network');
    if (networkParam && networks.some(n => n.id === networkParam)) {
      setSelectedNetwork(networkParam);
    } else {
      setSelectedNetwork('MTN');
    }
    
    fetchProducts();
    fetchUserBalance();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/purchase/products', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      const data = await response.json();
      if (data.success) {
        setProducts(data.data.products);
        setGroupedProducts(data.data.grouped);
        
        const networkParam = searchParams.get('network');
        if (networkParam && data.data.grouped[networkParam]) {
          setSelectedNetwork(networkParam);
        } else if (!selectedNetwork && Object.keys(data.data.grouped).length > 0) {
          setSelectedNetwork(Object.keys(data.data.grouped)[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUserBalance(0.397);
        return;
      }

      const response = await fetch('https://cletech-server.onrender.com/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUserBalance(data.data.walletBalance || 0.397);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
      setUserBalance(0.397);
    }
  };

  const formatPhone = (value) => {
    let cleaned = value.replace(/\D/g, '');
    
    if (cleaned.startsWith('233')) {
      cleaned = cleaned.substring(3);
    }
    if (cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
    }
    
    cleaned = cleaned.substring(0, 9);
    
    if (cleaned.length > 2 && cleaned.length <= 5) {
      return `0${cleaned.substring(0, 2)} ${cleaned.substring(2)}`;
    } else if (cleaned.length > 5) {
      return `0${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}`;
    }
    
    return cleaned ? `0${cleaned}` : '';
  };

  const validatePhone = (phone) => {
    const cleaned = phone.replace(/\D/g, '');
    return /^(0|233)?[2-9]\d{8}$/.test(cleaned);
  };

  const handlePurchase = async () => {
    if (!selectedProduct) {
      setError('Please select a data package');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid Ghana phone number');
      return;
    }

    const product = products.find(p => p.id === selectedProduct);
    if (!product) {
      setError('Invalid product selected');
      return;
    }

    if (paymentMethod === 'wallet' && userBalance < product.price) {
      setError('Insufficient wallet balance');
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      
      const response = await fetch('http://localhost:5000/api/purchase/buy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: cleanedPhone.startsWith('0') ? cleanedPhone : `0${cleanedPhone}`,
          network: product.network,
          capacity: product.capacity,
          gateway: paymentMethod
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Purchase successful! Data will be delivered shortly.');
        setPhoneNumber('');
        setSelectedProduct('');
        if (paymentMethod === 'wallet') {
          setUserBalance(prev => prev - product.price);
        }
        
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        setError(data.message || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      setError('Failed to process purchase. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  // Bulk Purchase Functions (remain the same)
  const parseBulkInput = () => {
    const lines = bulkManualInput.trim().split('\n');
    const parsed = [];
    const errors = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/\s+/);
      if (parts.length < 2) {
        errors.push({
          line: index + 1,
          error: 'Invalid format. Use: phoneNumber capacity'
        });
        return;
      }

      const phoneNumber = parts[0];
      const capacity = parseFloat(parts[1]);

      let cleanedPhone = phoneNumber.replace(/\D/g, '');
      if (cleanedPhone.startsWith('233')) {
        cleanedPhone = cleanedPhone.substring(3);
      }
      if (!cleanedPhone.startsWith('0')) {
        cleanedPhone = '0' + cleanedPhone;
      }

      if (!validatePhone(cleanedPhone)) {
        errors.push({
          line: index + 1,
          error: `Invalid phone number: ${phoneNumber}`
        });
        return;
      }

      if (!capacity || capacity < 0.1 || capacity > 100) {
        errors.push({
          line: index + 1,
          error: `Invalid capacity: ${capacity}`
        });
        return;
      }

      parsed.push({
        phoneNumber: cleanedPhone,
        capacity: capacity,
        network: selectedNetwork
      });
    });

    setBulkPurchases(parsed);
    setBulkErrors(errors);
    calculateBulkCost(parsed);
  };

  const calculateBulkCost = (purchases) => {
    let total = 0;
    purchases.forEach(purchase => {
      const product = products.find(p => 
        p.network === purchase.network && 
        p.capacity === purchase.capacity
      );
      if (product) {
        total += product.price;
      }
    });
    setBulkTotalCost(total);
  };

  const handleBulkPurchase = async () => {
    if (bulkPurchases.length === 0) {
      setError('No valid purchases to process');
      return;
    }

    if (bulkTotalCost > userBalance) {
      setError('Insufficient wallet balance for bulk purchase');
      return;
    }

    setBulkProcessing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://cletech-server.onrender.com/api/purchase/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          purchases: bulkPurchases,
          network: selectedNetwork,
          gateway: 'wallet'
        })
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response:', text);
        setError('Server returned invalid response');
        return;
      }

      if (data.success) {
        setSuccess(`Bulk purchase successful! ${data.data.totalPurchases} items processed.`);
        setShowBulkModal(false);
        setBulkManualInput('');
        setBulkPurchases([]);
        setUserBalance(data.data.newBalance);
        
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        setError(data.message || 'Bulk purchase failed');
      }
    } catch (error) {
      console.error('Bulk purchase error:', error);
      setError('Failed to process bulk purchase. Please try again.');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('network', selectedNetwork);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/purchase/parse-excel', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse response as JSON:', text);
        setError('Server returned invalid response');
        return;
      }

      if (data.success) {
        setBulkPurchases(data.data.purchases);
        setBulkErrors(data.data.errors || []);
        calculateBulkCost(data.data.purchases);
      } else {
        setError(data.message || 'Failed to parse file');
      }
    } catch (error) {
      console.error('File upload error:', error);
      setError('Failed to process file. Please try again.');
    }
  };

  const downloadTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/purchase/bulk-template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'bulk-purchase-template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Template download error:', error);
      setError('Failed to download template');
    }
  };

  const getNetworkColor = (networkId) => {
    const network = networks.find(n => n.id === networkId);
    return network ? network.color : '#2563EB';
  };

  const formatProductOption = (product) => {
    return `${product.network} ${product.capacity}GB - GH₵ ${product.price.toFixed(1)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Success/Error Messages */}
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Network Card Display */}
        {selectedNetwork && <NetworkCard network={selectedNetwork} />}

        {/* Main Purchase Form */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Purchase {selectedNetwork} Data
            </h1>
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <PackagePlus className="w-4 h-4 mr-2" />
              Bulk Purchase
            </button>
          </div>

          {/* Main Form */}
          <div className="space-y-6">
            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PHONE NUMBER <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                placeholder="Beneficiary Phone Number"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Package Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                SELECT MENU <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full appearance-none px-4 py-3 pr-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                  style={{
                    backgroundColor: selectedProduct ? getNetworkColor(selectedNetwork) : undefined,
                    color: selectedProduct ? 'white' : undefined,
                    borderColor: selectedProduct ? getNetworkColor(selectedNetwork) : undefined,
                  }}
                  disabled={loading}
                >
                  <option value="" className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                    Select package
                  </option>
                  {selectedNetwork && groupedProducts[selectedNetwork] && 
                    groupedProducts[selectedNetwork].map((product) => (
                      <option 
                        key={product.id} 
                        value={product.id}
                        className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {formatProductOption(product)}
                      </option>
                    ))
                  }
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white pointer-events-none" 
                  style={{ color: selectedProduct ? 'white' : '#9CA3AF' }}
                />
              </div>
            </div>

            {/* Available Balance */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Available Balance: 
                <span className="ml-2 font-semibold text-blue-600 dark:text-blue-400">
                  GH₵ {userBalance.toFixed(3)}
                </span>
              </div>
            </div>

            {/* Payment Options */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setPaymentMethod('wallet');
                  handlePurchase();
                }}
                disabled={purchasing || !selectedProduct || !phoneNumber}
                className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {purchasing && paymentMethod === 'wallet' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Pay with wallet'
                )}
              </button>
              
              <button
                onClick={() => window.location.href = '/deposit'}
                className="flex-1 px-6 py-3 bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-medium rounded-lg transition-colors"
              >
                Topup Wallet
              </button>
            </div>
          </div>
        </div>

        {/* Network Selection Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <div className="flex gap-2 overflow-x-auto">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => {
                  setSelectedNetwork(network.id);
                  setSelectedProduct('');
                }}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                  selectedNetwork === network.id
                    ? 'text-white shadow-md'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={{
                  backgroundColor: selectedNetwork === network.id ? network.color : undefined,
                }}
              >
                {network.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Purchase Modal (remains the same) */}
        <AnimatePresence>
          {showBulkModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowBulkModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal content remains exactly the same as before */}
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Bulk Purchase - {selectedNetwork}
                  </h2>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Input Method Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setBulkInputMethod('manual')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      bulkInputMethod === 'manual'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Manual Input
                  </button>
                  <button
                    onClick={() => setBulkInputMethod('file')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      bulkInputMethod === 'file'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Upload Excel
                  </button>
                </div>

                {/* Manual Input Section */}
                {bulkInputMethod === 'manual' ? (
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-medium mb-1">Format: phoneNumber capacity</p>
                          <p className="text-xs">Enter each purchase on a new line. Example:</p>
                          <pre className="text-xs mt-2 bg-white/50 dark:bg-gray-800/50 p-2 rounded">
{`0241234567 2
0551234567 5`}
                          </pre>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Bulk Data Entry
                        </label>
                        <button
                          onClick={() => setBulkManualInput(sampleBulkData)}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
                        >
                          Use Sample Data
                        </button>
                      </div>
                      <textarea
                        value={bulkManualInput}
                        onChange={(e) => setBulkManualInput(e.target.value)}
                        placeholder="0241234567 2&#10;0551234567 5&#10;0261234567 1"
                        rows={10}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                      />
                      <button
                        onClick={parseBulkInput}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        Parse Input
                      </button>
                    </div>
                  </div>
                ) : (
                  /* File Upload Section */
                  <div className="space-y-4">
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        const file = e.dataTransfer.files[0];
                        if (file) {
                          setBulkFile(file);
                          handleFileUpload(file);
                        }
                      }}
                    >
                      <FileSpreadsheet className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Drag & drop your Excel file here, or click to browse
                      </p>
                      <input
                        type="file"
                        accept=".xlsx,.xls,.csv"
                        className="hidden"
                        id="excel-upload"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setBulkFile(file);
                            handleFileUpload(file);
                          }
                        }}
                      />
                      <label
                        htmlFor="excel-upload"
                        className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
                      >
                        Choose File
                      </label>
                      <button
                        onClick={downloadTemplate}
                        className="ml-3 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                      >
                        <Download className="w-4 h-4 inline mr-2" />
                        Download Template
                      </button>
                    </div>
                    {bulkFile && (
                      <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {bulkFile.name}
                        </span>
                        <button
                          onClick={() => {
                            setBulkFile(null);
                            setBulkPurchases([]);
                            setBulkErrors([]);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Parsed Results */}
                {bulkPurchases.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Valid Purchases ({bulkPurchases.length})
                    </h3>
                    <div className="max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-700 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left">Phone Number</th>
                            <th className="px-4 py-2 text-left">Capacity (GB)</th>
                            <th className="px-4 py-2 text-left">Network</th>
                            <th className="px-4 py-2 text-left">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkPurchases.map((purchase, index) => (
                            <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                              <td className="px-4 py-2">{purchase.phoneNumber}</td>
                              <td className="px-4 py-2">{purchase.capacity}</td>
                              <td className="px-4 py-2">{purchase.network}</td>
                              <td className="px-4 py-2">
                                <button
                                  onClick={() => {
                                    setBulkPurchases(prev => prev.filter((_, i) => i !== index));
                                  }}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Errors */}
                {bulkErrors.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-red-600 dark:text-red-400 mb-2">
                      Errors ({bulkErrors.length})
                    </h3>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      {bulkErrors.map((error, index) => (
                        <div key={index} className="text-sm text-red-700 dark:text-red-300">
                          Line {error.line || error.row}: {error.error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary and Actions */}
                {bulkPurchases.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total Cost:
                        </span>
                        <span className="text-lg font-semibold text-gray-900 dark:text-white">
                          GH₵ {bulkTotalCost.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Available Balance:
                        </span>
                        <span className={`text-lg font-semibold ${
                          userBalance >= bulkTotalCost
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          GH₵ {userBalance.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleBulkPurchase}
                        disabled={bulkProcessing || bulkPurchases.length === 0 || bulkTotalCost > userBalance}
                        className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {bulkProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Processing...
                          </>
                        ) : (
                          `Process ${bulkPurchases.length} Purchase${bulkPurchases.length > 1 ? 's' : ''}`
                        )}
                      </button>
                      <button
                        onClick={() => setShowBulkModal(false)}
                        className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Loading fallback component
function PurchaseLoadingFallback() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600 dark:text-gray-400">Loading purchase page...</p>
      </div>
    </div>
  );
}

// Main export with Suspense boundary
export default function DataPurchase() {
  return (
    <Suspense fallback={<PurchaseLoadingFallback />}>
      <DataPurchaseContent />
    </Suspense>
  );
}
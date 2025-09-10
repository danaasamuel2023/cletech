// Secure Public Agent Store Component with Real Payment Integration and Network Selector
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, ShoppingCart, Phone, Mail, MapPin, Clock, Star,
  ChevronDown, Search, Filter, ShoppingBag, Users, Shield,
  CheckCircle, Zap, Gift, TrendingUp, MessageCircle, Share2,
  Facebook, Instagram, Twitter, Copy, ExternalLink, Loader2,
  X, Plus, Minus, AlertCircle, Check, ArrowRight, Sparkles,
  Moon, Sun, Trash2, Wallet, CreditCard, Home, Crown, UserPlus,
  Wifi, Signal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useSearchParams } from 'next/navigation';

export default function PublicAgentStore() {
  const params = useParams();
  const searchParams = useSearchParams();
  const subdomain = params.subdomain;

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);
  
  // State Management
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedBundleIndex, setSelectedBundleIndex] = useState(null);
  const [customerForm, setCustomerForm] = useState({
    phoneNumber: '',
    customerName: '',
    customerEmail: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [bundleMessages, setBundleMessages] = useState({});
  const [verifying, setVerifying] = useState(false);
  const [showAllNetworks, setShowAllNetworks] = useState(false);

  // Networks Configuration with enhanced colors
  const networks = {
    'MTN': { 
      id: 'MTN', 
      name: 'MTN', 
      color: '#FFCB05',
      gradient: 'from-yellow-400 to-yellow-500',
      icon: '📱'
    },
    'TELECEL': { 
      id: 'TELECEL', 
      name: 'Telecel', 
      color: '#E30613',
      gradient: 'from-red-600 to-red-700',
      icon: '📞'
    },
    'AT': { 
      id: 'AT', 
      name: 'AirtelTigo', 
      color: '#0066CC',
      gradient: 'from-blue-600 to-purple-600',
      icon: '📡'
    },
    'YELLO': { 
      id: 'YELLO', 
      name: 'Yello', 
      color: '#FFCB05',
      gradient: 'from-yellow-500 to-orange-500',
      icon: '📶'
    }
  };

  // Check for payment verification on mount
  useEffect(() => {
    const reference = searchParams.get('reference');
    const status = searchParams.get('status');
    const trxref = searchParams.get('trxref');
    
    if (reference || trxref) {
      verifyPayment(reference || trxref);
    } else if (status === 'cancelled') {
      setError('Payment was cancelled. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [searchParams]);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    fetchStoreData();
  }, [subdomain]);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      const storeResponse = await fetch(`https://api.cletech.shop/api/store/public/${subdomain}`);
      const storeData = await storeResponse.json();

      if (!storeData.success) {
        setError('Store not found');
        setLoading(false);
        return;
      }

      setStore(storeData.data);

      if (!storeData.data.operatingStatus?.isOpen) {
        setShowClosedModal(true);
      }

      const productsResponse = await fetch(`https://api.cletech.shop/api/store/public/${subdomain}/products`);
      const productsData = await productsResponse.json();

      if (productsData.success) {
        setProducts(productsData.data.products);
        setGroupedProducts(productsData.data.grouped);
        
        const availableNetworks = Object.keys(productsData.data.grouped);
        if (availableNetworks.length > 0) {
          setSelectedNetwork(availableNetworks[0]);
          // If only one network, show all networks view
          if (availableNetworks.length === 1) {
            setShowAllNetworks(true);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching store:', error);
      setError('Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const verifyPayment = async (reference) => {
    setVerifying(true);
    setError('');
    
    try {
      const response = await fetch(`https://api.cletech.shop/api/purchase/verify/${reference}`);
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Payment successful! Your data bundle is being processed.');
        localStorage.removeItem('pendingPurchase');
        window.history.replaceState({}, document.title, window.location.pathname);
        setTimeout(() => {
          setSuccess('');
        }, 10000);
      } else {
        setError(data.message || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify payment. Please contact support.');
    } finally {
      setVerifying(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
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

  const handleSelectBundle = (bundleIndex, networkId) => {
    const bundleKey = `${networkId}-${bundleIndex}`;
    setSelectedBundleIndex(bundleKey);
    setSelectedNetwork(networkId);
    setCustomerForm({
      phoneNumber: '',
      customerName: '',
      customerEmail: ''
    });
    setBundleMessages({});
  };

  const handlePurchase = async (bundle, bundleKey) => {
    setBundleMessages(prev => ({ ...prev, [bundleKey]: null }));
    
    const cleanPhone = customerForm.phoneNumber.replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setBundleMessages(prev => ({ 
        ...prev, 
        [bundleKey]: { text: 'Please enter a valid phone number', type: 'error' } 
      }));
      return;
    }

    if (!store.operatingStatus?.isOpen) {
      setBundleMessages(prev => ({ 
        ...prev, 
        [bundleKey]: { text: 'Store is currently closed', type: 'error' } 
      }));
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      const response = await fetch(`https://api.cletech.shop/api/purchase/store/${subdomain}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: cleanPhone,
          network: bundle.network,
          capacity: bundle.capacity,
          customerName: customerForm.customerName || 'Guest',
          customerEmail: customerForm.customerEmail || ''
        })
      });

      const data = await response.json();

      if (data.success && data.requiresPayment && data.data.paymentUrl) {
        localStorage.setItem('pendingPurchase', JSON.stringify({
          reference: data.data.reference,
          amount: data.data.amount,
          network: data.data.network,
          capacity: data.data.capacity,
          phoneNumber: data.data.phoneNumber,
          storeName: data.data.storeName
        }));

        setBundleMessages(prev => ({ 
          ...prev, 
          [bundleKey]: { text: 'Redirecting to payment...', type: 'success' } 
        }));
        
        setTimeout(() => {
          window.location.href = data.data.paymentUrl;
        }, 1500);
        
      } else {
        setBundleMessages(prev => ({ 
          ...prev, 
          [bundleKey]: { text: data.message || 'Purchase failed', type: 'error' } 
        }));
      }
    } catch (err) {
      console.error('Purchase error:', err);
      setBundleMessages(prev => ({ 
        ...prev, 
        [bundleKey]: { text: 'Failed to process purchase. Please try again.', type: 'error' } 
      }));
    } finally {
      setPurchasing(false);
    }
  };

  const shareStore = async () => {
    const shareUrl = `${window.location.origin}/store/${subdomain}`;
    const shareText = `Check out ${store?.storeName} for the best data bundle prices! 🔥`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: store?.storeName,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setSuccess('Store link copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  // Network Logo Components
  const MTNLogo = () => (
    <svg width="60" height="60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="#ffcc00" stroke="#000" strokeWidth="2"/>
      <path d="M50 80 L80 140 L100 80 L120 140 L150 80" stroke="#000" strokeWidth="12" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <text x="100" y="170" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="28">MTN</text>
    </svg>
  );

  const TelecelLogo = () => (
    <svg width="60" height="60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="#ffffff" stroke="#cc0000" strokeWidth="2"/>
      <text x="100" y="110" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="32" fill="#cc0000">TELECEL</text>
      <path d="M50 125 L150 125" stroke="#cc0000" strokeWidth="5" strokeLinecap="round"/>
    </svg>
  );

  const AirtelTigoLogo = () => (
    <svg width="60" height="60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="atGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0066CC', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="85" fill="url(#atGradient)" stroke="#1e40af" strokeWidth="3"/>
      <text x="100" y="115" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="55" fill="white">AT</text>
    </svg>
  );

  const YelloLogo = () => (
    <svg width="60" height="60" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <circle cx="100" cy="100" r="85" fill="#ffcc00" stroke="#000" strokeWidth="2"/>
      <text x="100" y="120" textAnchor="middle" fontFamily="Arial" fontWeight="bold" fontSize="40" fill="#000">YELLO</text>
    </svg>
  );

  const getNetworkLogo = (networkId) => {
    switch(networkId) {
      case 'MTN': return <MTNLogo />;
      case 'TELECEL': return <TelecelLogo />;
      case 'AT': return <AirtelTigoLogo />;
      case 'YELLO': return <YelloLogo />;
      default: return <MTNLogo />;
    }
  };

  const getNetworkStyles = (networkId) => {
    switch(networkId) {
      case 'MTN':
      case 'YELLO':
        return {
          cardBg: 'bg-yellow-400',
          textColor: 'text-black',
          bottomBg: 'bg-black',
          bottomText: 'text-white'
        };
      case 'TELECEL':
        return {
          cardBg: 'bg-gradient-to-tr from-red-700 to-red-500',
          textColor: 'text-white',
          bottomBg: 'bg-black/80',
          bottomText: 'text-white'
        };
      case 'AT':
        return {
          cardBg: 'bg-gradient-to-r from-blue-700 to-purple-700',
          textColor: 'text-white',
          bottomBg: 'bg-black',
          bottomText: 'text-white'
        };
      default:
        return {
          cardBg: 'bg-gray-400',
          textColor: 'text-white',
          bottomBg: 'bg-black',
          bottomText: 'text-white'
        };
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading store...</p>
        </div>
      </div>
    );
  }

  // Payment verification overlay
  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Verifying Payment</h2>
          <p className="text-gray-600 dark:text-gray-300">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Store Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">This store doesn't exist or is temporarily unavailable.</p>
        </div>
      </div>
    );
  }

  const availableNetworks = Object.keys(groupedProducts);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-gray-700" />}
      </button>

      {/* Success/Error Toasts */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center"
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
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center"
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Store className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {store.storeName}
                  {store.operatingStatus?.isOpen ? (
                    <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-medium rounded-full">
                      Open
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-xs font-medium rounded-full">
                      Closed
                    </span>
                  )}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Best Data Bundle Prices</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={shareStore}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* WhatsApp Contact Strip */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-3">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <a
                href={`https://wa.me/${store.whatsappNumber?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Owner: {store.whatsappNumber}</span>
              </a>

              {store.whatsappGroupLink && (
                <a
                  href={store.whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                  <span className="text-sm font-medium">Join WhatsApp Group</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${store.whatsappNumber?.replace(/\D/g, '')}?text=Hi, I want to buy data bundles`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-1.5 bg-white text-green-700 font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Quick Order
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Store Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">WhatsApp Contact</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Direct message for instant support</p>
                <a
                  href={`https://wa.me/${store.whatsappNumber?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 dark:text-green-400 hover:underline text-sm font-medium"
                >
                  {store.whatsappNumber}
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Join Our Community</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Get exclusive deals & updates</p>
                {store.whatsappGroupLink ? (
                  <a
                    href={store.whatsappGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                  >
                    Join Group →
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">No group available</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">Store Hours</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Mon-Fri: 8AM - 10PM<br/>
                  Sat-Sun: 9AM - 8PM
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Network Selector - NEW ENHANCED UI */}
        {availableNetworks.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Available Networks
              </h2>
              <div className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {availableNetworks.length} network{availableNetworks.length > 1 ? 's' : ''} available
                </span>
              </div>
            </div>

            {/* Network Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap gap-3">
                {/* Show All Option (only if multiple networks) */}
                {availableNetworks.length > 1 && (
                  <button
                    onClick={() => setShowAllNetworks(!showAllNetworks)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      showAllNetworks
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    <Signal className="w-4 h-4" />
                    <span>Show All Networks</span>
                  </button>
                )}

                {/* Individual Network Buttons */}
                {availableNetworks.map((networkId) => {
                  const network = networks[networkId] || { name: networkId, gradient: 'from-gray-500 to-gray-600' };
                  const productCount = groupedProducts[networkId]?.length || 0;
                  
                  return (
                    <button
                      key={networkId}
                      onClick={() => {
                        setSelectedNetwork(networkId);
                        setShowAllNetworks(false);
                      }}
                      className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        !showAllNetworks && selectedNetwork === networkId
                          ? `bg-gradient-to-r ${network.gradient} text-white shadow-lg scale-105`
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-blue-500 hover:shadow-md'
                      }`}
                      disabled={showAllNetworks}
                    >
                      <span className="text-lg">{network.icon}</span>
                      <span>{network.name}</span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        !showAllNetworks && selectedNetwork === networkId
                          ? 'bg-white/20 text-white'
                          : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                      }`}>
                        {productCount} {productCount === 1 ? 'package' : 'packages'}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Helper Text */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300 flex items-start">
                  <Sparkles className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                  {showAllNetworks 
                    ? "Viewing all networks. Click on a specific network to filter packages."
                    : `Showing ${networks[selectedNetwork]?.name || selectedNetwork} packages. Click "Show All Networks" to view everything.`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Products Display */}
        {showAllNetworks ? (
          // Show All Networks View
          availableNetworks.map((networkId) => {
            const networkProducts = groupedProducts[networkId];
            const network = networks[networkId] || { name: networkId };
            
            if (!networkProducts || networkProducts.length === 0) return null;
            
            return (
              <div key={networkId} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{network.icon}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {network.name} Data Packages
                    </h3>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                    {networkProducts.length} packages
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {networkProducts.sort((a, b) => a.capacity - b.capacity).map((bundle, index) => {
                    const styles = getNetworkStyles(networkId);
                    const bundleKey = `${networkId}-${index}`;
                    
                    return (
                      <div key={bundleKey} className="flex flex-col relative">
                        <div 
                          className={`flex flex-col ${styles.cardBg} ${styles.textColor} overflow-hidden shadow-md transition-transform duration-300 cursor-pointer hover:translate-y-[-5px] ${
                            selectedBundleIndex === bundleKey ? 'rounded-t-lg' : 'rounded-lg'
                          }`}
                          onClick={() => handleSelectBundle(index, networkId)}
                        >
                          {!store.operatingStatus?.isOpen && (
                            <div className="absolute top-2 right-2 z-10">
                              <span className="bg-red-600 text-white text-xs font-bold py-1 px-2 rounded-full shadow-lg">
                                STORE CLOSED
                              </span>
                            </div>
                          )}
                          
                          <div className="flex flex-col items-center justify-center p-5 space-y-3">
                            <div className="w-16 h-16 flex justify-center items-center">
                              {getNetworkLogo(networkId)}
                            </div>
                            <h3 className="text-xl font-bold">
                              {bundle.capacity} GB
                            </h3>
                          </div>
                          
                          <div className={`grid grid-cols-2 ${styles.bottomBg} ${styles.bottomText}`}
                               style={{ borderRadius: selectedBundleIndex === bundleKey ? '0' : '0 0 0.5rem 0.5rem' }}>
                            <div className="flex flex-col items-center justify-center p-3 text-center border-r border-gray-600">
                              <p className="text-lg">GH₵ {bundle.price.toFixed(2)}</p>
                              <p className="text-sm font-bold">Price</p>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 text-center">
                              <p className="text-lg">30 Days</p>
                              <p className="text-sm font-bold">Validity</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Purchase Form */}
                        {selectedBundleIndex === bundleKey && (
                          <div className={`${styles.cardBg} p-4 rounded-b-lg shadow-md`}>
                            {bundleMessages[bundleKey] && (
                              <div className={`mb-3 p-3 rounded ${
                                bundleMessages[bundleKey].type === 'success' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {bundleMessages[bundleKey].text}
                              </div>
                            )}
                            
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Phone Number *
                                </label>
                                <input
                                  type="tel"
                                  className="w-full px-4 py-2 rounded bg-white/90 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:border-blue-500"
                                  placeholder="024 123 4567"
                                  value={customerForm.phoneNumber}
                                  onChange={(e) => setCustomerForm({
                                    ...customerForm,
                                    phoneNumber: formatPhone(e.target.value)
                                  })}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Your Name (Optional)
                                </label>
                                <input
                                  type="text"
                                  className="w-full px-4 py-2 rounded bg-white/90 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:border-blue-500"
                                  placeholder="John Doe"
                                  value={customerForm.customerName}
                                  onChange={(e) => setCustomerForm({
                                    ...customerForm,
                                    customerName: e.target.value
                                  })}
                                />
                              </div>

                              <div>
                                <label className="block text-sm font-medium mb-1">
                                  Email (Optional)
                                </label>
                                <input
                                  type="email"
                                  className="w-full px-4 py-2 rounded bg-white/90 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:border-blue-500"
                                  placeholder="john@example.com"
                                  value={customerForm.customerEmail}
                                  onChange={(e) => setCustomerForm({
                                    ...customerForm,
                                    customerEmail: e.target.value
                                  })}
                                />
                              </div>

                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-start">
                                  <CreditCard className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                                  <div className="text-sm text-blue-800">
                                    <p className="font-medium mb-1">Secure Payment Required</p>
                                    <p>You will be redirected to Paystack to complete payment securely.</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <button
                              onClick={() => handlePurchase(bundle, bundleKey)}
                              disabled={!store.operatingStatus?.isOpen || purchasing}
                              className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                            >
                              {purchasing ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Processing...
                                </>
                              ) : !store.operatingStatus?.isOpen ? (
                                'Store Closed'
                              ) : (
                                <>
                                  <CreditCard className="w-4 h-4 mr-2" />
                                  Proceed to Payment
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          // Single Network View
          selectedNetwork && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{networks[selectedNetwork]?.icon}</span>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {networks[selectedNetwork]?.name || selectedNetwork} Data Packages
                  </h3>
                </div>
                <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                  {groupedProducts[selectedNetwork]?.length || 0} packages
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {groupedProducts[selectedNetwork]?.sort((a, b) => a.capacity - b.capacity).map((bundle, index) => {
                  const styles = getNetworkStyles(selectedNetwork);
                  const bundleKey = `${selectedNetwork}-${index}`;
                  
                  return (
                    <div key={bundleKey} className="flex flex-col relative">
                      <div 
                        className={`flex flex-col ${styles.cardBg} ${styles.textColor} overflow-hidden shadow-md transition-transform duration-300 cursor-pointer hover:translate-y-[-5px] ${
                          selectedBundleIndex === bundleKey ? 'rounded-t-lg' : 'rounded-lg'
                        }`}
                        onClick={() => handleSelectBundle(index, selectedNetwork)}
                      >
                        {!store.operatingStatus?.isOpen && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="bg-red-600 text-white text-xs font-bold py-1 px-2 rounded-full shadow-lg">
                              STORE CLOSED
                            </span>
                          </div>
                        )}
                        
                        <div className="flex flex-col items-center justify-center p-5 space-y-3">
                          <div className="w-20 h-20 flex justify-center items-center">
                            {getNetworkLogo(selectedNetwork)}
                          </div>
                          <h3 className="text-xl font-bold">
                            {bundle.capacity} GB
                          </h3>
                        </div>
                        
                        <div className={`grid grid-cols-2 ${styles.bottomBg} ${styles.bottomText}`}
                             style={{ borderRadius: selectedBundleIndex === bundleKey ? '0' : '0 0 0.5rem 0.5rem' }}>
                          <div className="flex flex-col items-center justify-center p-3 text-center border-r border-gray-600">
                            <p className="text-lg">GH₵ {bundle.price.toFixed(2)}</p>
                            <p className="text-sm font-bold">Price</p>
                          </div>
                          <div className="flex flex-col items-center justify-center p-3 text-center">
                            <p className="text-lg">30 Days</p>
                            <p className="text-sm font-bold">Validity</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Purchase Form */}
                      {selectedBundleIndex === bundleKey && (
                        <div className={`${styles.cardBg} p-4 rounded-b-lg shadow-md`}>
                          {bundleMessages[bundleKey] && (
                            <div className={`mb-3 p-3 rounded ${
                              bundleMessages[bundleKey].type === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {bundleMessages[bundleKey].text}
                            </div>
                          )}
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                className="w-full px-4 py-2 rounded bg-white/90 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:border-blue-500"
                                placeholder="024 123 4567"
                                value={customerForm.phoneNumber}
                                onChange={(e) => setCustomerForm({
                                  ...customerForm,
                                  phoneNumber: formatPhone(e.target.value)
                                })}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Your Name (Optional)
                              </label>
                              <input
                                type="text"
                                className="w-full px-4 py-2 rounded bg-white/90 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:border-blue-500"
                                placeholder="John Doe"
                                value={customerForm.customerName}
                                onChange={(e) => setCustomerForm({
                                  ...customerForm,
                                  customerName: e.target.value
                                })}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Email (Optional)
                              </label>
                              <input
                                type="email"
                                className="w-full px-4 py-2 rounded bg-white/90 text-gray-900 placeholder-gray-500 border border-gray-300 focus:outline-none focus:border-blue-500"
                                placeholder="john@example.com"
                                value={customerForm.customerEmail}
                                onChange={(e) => setCustomerForm({
                                  ...customerForm,
                                  customerEmail: e.target.value
                                })}
                              />
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <div className="flex items-start">
                                <CreditCard className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800">
                                  <p className="font-medium mb-1">Secure Payment Required</p>
                                  <p>You will be redirected to Paystack to complete payment securely.</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handlePurchase(bundle, bundleKey)}
                            disabled={!store.operatingStatus?.isOpen || purchasing}
                            className="w-full mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                          >
                            {purchasing ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                Processing...
                              </>
                            ) : !store.operatingStatus?.isOpen ? (
                              'Store Closed'
                            ) : (
                              <>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Proceed to Payment
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        )}

        {/* Trust Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <Shield className="w-12 h-12 text-green-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Payments</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Powered by Paystack</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <Zap className="w-12 h-12 text-yellow-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Delivery</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Get your data in seconds</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">24/7 Support</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Always here to help</p>
          </div>
        </div>
      </div>

      {/* Store Closed Modal */}
      <AnimatePresence>
        {showClosedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Store is Currently Closed
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We're not accepting orders right now. Please check back during our operating hours.
                </p>
              </div>

              <div className="space-y-3">
                <a
                  href={`https://wa.me/${store?.whatsappNumber?.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Owner on WhatsApp
                </a>

                {store?.whatsappGroupLink && (
                  <a
                    href={store.whatsappGroupLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex items-center justify-center"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Join WhatsApp Group
                  </a>
                )}
                
                <button
                  onClick={() => setShowClosedModal(false)}
                  className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg"
                >
                  Browse Products Anyway
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
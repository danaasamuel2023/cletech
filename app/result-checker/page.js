// app/checkers/page.js - Result Checker Purchase Page
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Loader2, Phone, CreditCard, Wallet, ChevronDown,
  AlertCircle, Check, Upload, FileSpreadsheet, X,
  Plus, Trash2, Copy, Info, PackagePlus, Download,
  Calendar, Clock, ShieldCheck, Award, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

export default function CheckerPurchase() {
  const searchParams = useSearchParams();
  
  // States
  const [selectedType, setSelectedType] = useState('WASSCE');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedExamType, setSelectedExamType] = useState('MAY/JUNE');
  const [availableCheckers, setAvailableCheckers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [studentName, setStudentName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [checkerPrice, setCheckerPrice] = useState(0);
  const [myCheckers, setMyCheckers] = useState([]);
  const [showMyCheckers, setShowMyCheckers] = useState(false);
  
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

  const checkerTypes = [
    { id: 'WASSCE', name: 'WASSCE', icon: GraduationCap, color: '#2563EB' },
    { id: 'BECE', name: 'BECE', icon: Award, color: '#10B981' }
  ];

  const examTypes = [
    { id: 'MAY/JUNE', name: 'May/June' },
    { id: 'NOV/DEC', name: 'Nov/Dec' },
    { id: 'PRIVATE', name: 'Private' }
  ];

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const sampleBulkData = `0241234567 John Doe john@example.com 2
0551234567 Jane Smith jane@example.com 1
0261234567 Mike Johnson mike@example.com 3`;

  useEffect(() => {
    fetchAvailableCheckers();
    fetchUserBalance();
    fetchMyCheckers();
  }, [selectedType, selectedYear, selectedExamType]);

  const fetchAvailableCheckers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: selectedType,
        year: selectedYear,
        examType: selectedExamType
      });

      const response = await fetch(`https://cletech-server.onrender.com/api/checkers/available?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setAvailableCheckers(data.data);
        
        // Get price for selected checker
        const checker = data.data.find(c => 
          c.type === selectedType && 
          c.year === selectedYear && 
          c.examType === selectedExamType
        );
        
        if (checker) {
          setCheckerPrice(checker.price);
        }
      }
    } catch (error) {
      console.error('Error fetching checkers:', error);
      setError('Failed to load available checkers');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://cletech-server.onrender.com/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUserBalance(data.data.walletBalance || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchMyCheckers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('https://cletech-server.onrender.com/api/checkers/my-checkers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setMyCheckers(data.data);
      }
    } catch (error) {
      console.error('Error fetching my checkers:', error);
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
    if (!validatePhone(phoneNumber)) {
      setError('Please enter a valid Ghana phone number');
      return;
    }

    const totalCost = checkerPrice * quantity;
    if (paymentMethod === 'wallet' && userBalance < totalCost) {
      setError('Insufficient wallet balance');
      return;
    }

    setPurchasing(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      
      const response = await fetch('https://cletech-server.onrender.com/api/checkers/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: selectedType,
          year: selectedYear,
          examType: selectedExamType,
          phoneNumber: cleanedPhone.startsWith('0') ? cleanedPhone : `0${cleanedPhone}`,
          email: email || undefined,
          name: studentName || undefined,
          gateway: paymentMethod,
          quantity
        })
      });

      const data = await response.json();

      if (data.success) {
        if (paymentMethod === 'paystack' && data.data.authorizationUrl) {
          // Redirect to Paystack
          window.location.href = data.data.authorizationUrl;
        } else {
          // Wallet payment successful
          setSuccess(`Successfully purchased ${quantity} ${selectedType} checker(s)!`);
          setPhoneNumber('');
          setEmail('');
          setStudentName('');
          setQuantity(1);
          setUserBalance(prev => prev - totalCost);
          fetchMyCheckers();
          
          // Show checker details
          if (data.data.checkers) {
            showCheckerDetails(data.data.checkers);
          }
          
          setTimeout(() => {
            setSuccess('');
          }, 5000);
        }
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

  const showCheckerDetails = (checkers) => {
    // You can implement a modal or notification to show the checker details
    console.log('Purchased checkers:', checkers);
  };

  const parseBulkInput = () => {
    const lines = bulkManualInput.trim().split('\n');
    const parsed = [];
    const errors = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      const parts = trimmed.split(/\s+/);
      if (parts.length < 4) {
        errors.push({
          line: index + 1,
          error: 'Invalid format. Use: phoneNumber name email quantity'
        });
        return;
      }

      const phoneNumber = parts[0];
      const name = parts.slice(1, -2).join(' ');
      const email = parts[parts.length - 2];
      const quantity = parseInt(parts[parts.length - 1]);

      if (!validatePhone(phoneNumber)) {
        errors.push({
          line: index + 1,
          error: `Invalid phone number: ${phoneNumber}`
        });
        return;
      }

      if (!quantity || quantity < 1) {
        errors.push({
          line: index + 1,
          error: `Invalid quantity: ${quantity}`
        });
        return;
      }

      parsed.push({
        phoneNumber: formatPhone(phoneNumber),
        name,
        email,
        quantity,
        type: selectedType,
        year: selectedYear,
        examType: selectedExamType
      });
    });

    setBulkPurchases(parsed);
    setBulkErrors(errors);
    calculateBulkCost(parsed);
  };

  const calculateBulkCost = (purchases) => {
    const total = purchases.reduce((sum, p) => sum + (checkerPrice * p.quantity), 0);
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
      
      // Process each purchase
      for (const purchase of bulkPurchases) {
        const response = await fetch('https://cletech-server.onrender.com/api/checkers/purchase', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...purchase,
            gateway: 'wallet'
          })
        });

        const data = await response.json();
        if (!data.success) {
          console.error(`Failed to process purchase for ${purchase.phoneNumber}`);
        }
      }

      setSuccess(`Bulk purchase successful! ${bulkPurchases.length} items processed.`);
      setShowBulkModal(false);
      setBulkManualInput('');
      setBulkPurchases([]);
      fetchUserBalance();
      fetchMyCheckers();
      
      setTimeout(() => {
        setSuccess('');
      }, 5000);
    } catch (error) {
      console.error('Bulk purchase error:', error);
      setError('Failed to process bulk purchase. Please try again.');
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleUseChecker = async (checkerId, studentPhone) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://cletech-server.onrender.com/api/checkers/use/${checkerId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          studentPhoneNumber: studentPhone
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess('Checker activated successfully!');
        fetchMyCheckers();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error using checker:', error);
      setError('Failed to activate checker');
    }
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
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center max-w-md"
          >
            <Check className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{success}</span>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center max-w-md"
          >
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Result Checker Purchase
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Purchase WASSCE and BECE result checkers instantly
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Purchase Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Purchase Checker
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowMyCheckers(!showMyCheckers)}
                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                  >
                    My Checkers ({myCheckers.length})
                  </button>
                  <button
                    onClick={() => setShowBulkModal(true)}
                    className="flex items-center px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <PackagePlus className="w-4 h-4 mr-2" />
                    Bulk Purchase
                  </button>
                </div>
              </div>

              {/* Checker Type Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Select Exam Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {checkerTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.id}
                        onClick={() => setSelectedType(type.id)}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedType === type.id
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      >
                        <Icon className={`w-8 h-8 mx-auto mb-2 ${
                          selectedType === type.id 
                            ? 'text-blue-600 dark:text-blue-400' 
                            : 'text-gray-400'
                        }`} />
                        <div className="font-medium text-gray-900 dark:text-white">
                          {type.name}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Year and Exam Type Selection */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year
                  </label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Exam Period
                  </label>
                  <select
                    value={selectedExamType}
                    onChange={(e) => setSelectedExamType(e.target.value)}
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {examTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(formatPhone(e.target.value))}
                      placeholder="024 123 4567"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Student Name
                    </label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Price per checker:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    GH₵ {checkerPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Quantity:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {quantity}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      Total:
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      GH₵ {(checkerPrice * quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Options */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setPaymentMethod('wallet');
                    handlePurchase();
                  }}
                  disabled={purchasing || !phoneNumber || loading}
                  className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {purchasing && paymentMethod === 'wallet' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-4 h-4 mr-2" />
                      Pay with Wallet
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => {
                    setPaymentMethod('paystack');
                    handlePurchase();
                  }}
                  disabled={purchasing || !phoneNumber || loading}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {purchasing && paymentMethod === 'paystack' ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay with Card
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Wallet Balance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Wallet Balance
              </h3>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                GH₵ {userBalance.toFixed(2)}
              </div>
              <button
                onClick={() => window.location.href = '/wallet/topup'}
                className="mt-4 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Top Up Wallet
              </button>
            </div>

            {/* Checker Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Checker Information
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Valid for 1 year from purchase date
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Can be used up to 5 times
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Serial number and PIN sent instantly
                  </div>
                </div>
              </div>
            </div>

            {/* Available Stock */}
            {availableCheckers.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Available Stock
                </h3>
                <div className="space-y-2">
                  {availableCheckers.map((checker, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div className="text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {checker.type} {checker.year}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {checker.examType}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {checker.available} available
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          GH₵ {checker.price}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* My Checkers Section */}
        <AnimatePresence>
          {showMyCheckers && myCheckers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  My Purchased Checkers
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Year</th>
                        <th className="px-4 py-3 text-left">Serial Number</th>
                        <th className="px-4 py-3 text-left">PIN</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Uses</th>
                        <th className="px-4 py-3 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myCheckers.map((checker) => (
                        <tr key={checker._id} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-4 py-3">{checker.type}</td>
                          <td className="px-4 py-3">{checker.year}</td>
                          <td className="px-4 py-3 font-mono">{checker.serialNumber}</td>
                          <td className="px-4 py-3 font-mono">{checker.pin}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              checker.status === 'sold' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                            }`}>
                              {checker.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {checker.usageInfo?.usageCount || 0}/5
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(`Serial: ${checker.serialNumber}, PIN: ${checker.pin}`);
                                setSuccess('Copied to clipboard!');
                                setTimeout(() => setSuccess(''), 2000);
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bulk Purchase Modal */}
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
                {/* Modal Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Bulk Purchase - {selectedType} {selectedYear}
                  </h2>
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Manual Input Section */}
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-blue-800 dark:text-blue-200">
                        <p className="font-medium mb-1">Format: phoneNumber name email quantity</p>
                        <p className="text-xs">Enter each purchase on a new line. Example:</p>
                        <pre className="text-xs mt-2 bg-white/50 dark:bg-gray-800/50 p-2 rounded">
{`0241234567 John Doe john@example.com 2
0551234567 Jane Smith jane@example.com 1`}
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
                      placeholder="0241234567 John Doe john@example.com 2"
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
                            <th className="px-4 py-2 text-left">Phone</th>
                            <th className="px-4 py-2 text-left">Name</th>
                            <th className="px-4 py-2 text-left">Email</th>
                            <th className="px-4 py-2 text-left">Qty</th>
                            <th className="px-4 py-2 text-left">Price</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkPurchases.map((purchase, index) => (
                            <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                              <td className="px-4 py-2">{purchase.phoneNumber}</td>
                              <td className="px-4 py-2">{purchase.name}</td>
                              <td className="px-4 py-2 text-xs">{purchase.email}</td>
                              <td className="px-4 py-2">{purchase.quantity}</td>
                              <td className="px-4 py-2">GH₵ {(checkerPrice * purchase.quantity).toFixed(2)}</td>
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
                          Line {error.line}: {error.error}
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
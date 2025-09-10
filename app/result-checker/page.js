// app/result-checker/page.js - Result Checker Purchase Page
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Loader2, Phone, CreditCard, Wallet, ChevronDown,
  AlertCircle, Check, X, Copy, Info, Calendar, 
  Clock, ShieldCheck, Award, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

function CheckerPurchase() {
  const searchParams = useSearchParams();
  
  // States
  const [selectedType, setSelectedType] = useState('WASSCE');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedExamType, setSelectedExamType] = useState('MAY/JUNE');
  const [availableCheckers, setAvailableCheckers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userBalance, setUserBalance] = useState(0);
  const [checkerPrice, setCheckerPrice] = useState(0);
  const [myCheckers, setMyCheckers] = useState([]);
  const [showMyCheckers, setShowMyCheckers] = useState(false);

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

      const response = await fetch(`https://api.cletech.shop/api/checkers/available?${params}`);
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

      const response = await fetch('https://api.cletech.shop/api/auth/profile', {
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

      const response = await fetch('https://api.cletech.shop/api/checkers/my-checkers', {
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
      
      const response = await fetch('https://api.cletech.shop/api/checkers/purchase', {
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

  const handleUseChecker = async (checkerId, studentPhone) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://api.cletech.shop/api/checkers/use/${checkerId}`, {
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
                <button
                  onClick={() => setShowMyCheckers(!showMyCheckers)}
                  className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  My Checkers ({myCheckers.length})
                </button>
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
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckerPurchase />
    </Suspense>
  );
}
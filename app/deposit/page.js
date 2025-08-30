'use client'
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Wallet, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Info,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp
} from 'lucide-react';

const PaystackDeposit = () => {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [recentDeposits, setRecentDeposits] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [quickAmounts] = useState([10, 20, 50, 100, 200, 500]);

  useEffect(() => {
    fetchPaymentConfig();
    fetchUserWallet();
    fetchRecentDeposits();
  }, []);

  const fetchPaymentConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/deposites/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPaymentConfig(data.data);
      }
    } catch (err) {
      console.error('Error fetching payment config:', err);
    }
  };

  const fetchUserWallet = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/users/wallet', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUserBalance(data.data.balance);
      }
    } catch (err) {
      console.error('Error fetching wallet:', err);
    }
  };

  const fetchRecentDeposits = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/deposits/history?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setRecentDeposits(data.data.deposits);
      }
    } catch (err) {
      console.error('Error fetching deposits:', err);
    }
  };

  const initializePayment = async () => {
    setError('');
    setSuccess('');

    // Validate amount
    const depositAmount = parseFloat(amount);
    if (!depositAmount || depositAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (paymentConfig) {
      const { minTransaction, maxTransaction } = paymentConfig.limits;
      if (depositAmount < minTransaction) {
        setError(`Minimum deposit is ${paymentConfig.paystack.currencySymbol}${minTransaction}`);
        return;
      }
      if (depositAmount > maxTransaction) {
        setError(`Maximum deposit is ${paymentConfig.paystack.currencySymbol}${maxTransaction}`);
        return;
      }
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://cletech-server.onrender.com/api/deposites/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: depositAmount })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to Paystack payment page
        window.location.href = data.data.authorizationUrl;
      } else {
        setError(data.message || 'Failed to initialize payment');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
    setError('');
  };

  const formatCurrency = (value) => {
    const symbol = paymentConfig?.paystack?.currencySymbol || '₵';
    return `${symbol}${parseFloat(value).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Fund Your Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Add money to your wallet using secure payment methods
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Deposit Form */}
          <div className="md:col-span-2 space-y-6">
            {/* Current Balance Card */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Current Balance</p>
                  <p className="text-3xl font-bold">{formatCurrency(userBalance)}</p>
                  <div className="flex items-center mt-2 text-purple-200 text-sm">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>+12.5% this month</span>
                  </div>
                </div>
                <div className="bg-white/20 p-4 rounded-xl">
                  <Wallet className="w-8 h-8" />
                </div>
              </div>
            </div>

            {/* Deposit Form */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <div className="flex items-center mb-6">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl mr-4">
                  <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Add Money
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose amount to deposit
                  </p>
                </div>
              </div>

              {/* Quick Amount Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Quick Select
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {quickAmounts.map((value) => (
                    <button
                      key={value}
                      onClick={() => handleQuickAmount(value)}
                      className={`py-3 px-4 rounded-lg font-medium transition-all ${
                        amount === value.toString()
                          ? 'bg-purple-600 text-white shadow-lg scale-105'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {formatCurrency(value)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Custom Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 text-lg font-medium">
                    {paymentConfig?.paystack?.currencySymbol || '₵'}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setError('');
                    }}
                    placeholder="0.00"
                    className="w-full pl-10 pr-4 py-4 text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-colors"
                    min={paymentConfig?.limits?.minTransaction || 1}
                    max={paymentConfig?.limits?.maxTransaction || 10000}
                    step="0.01"
                  />
                </div>
                {paymentConfig && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Min: {formatCurrency(paymentConfig.limits.minTransaction)} | 
                    Max: {formatCurrency(paymentConfig.limits.maxTransaction)}
                  </p>
                )}
              </div>

              {/* Transaction Fee Info */}
              {paymentConfig?.fees?.transactionFee > 0 && amount && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3" />
                    <div className="text-sm">
                      <p className="text-blue-900 dark:text-blue-300 font-medium">
                        Transaction Fee: {paymentConfig.fees.transactionFee}%
                      </p>
                      <p className="text-blue-700 dark:text-blue-400 mt-1">
                        You'll be charged approximately {formatCurrency(amount * (1 + paymentConfig.fees.transactionFee / 100))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
                    <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3" />
                    <p className="text-green-700 dark:text-green-300 text-sm">{success}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={initializePayment}
                disabled={loading || !amount}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-medium text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Proceed to Payment
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </button>

              {/* Security Note */}
              <div className="flex items-center justify-center mt-4 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="w-4 h-4 mr-1" />
                Secured by Paystack
              </div>
            </div>

            {/* Payment Methods */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Accepted Payment Methods
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['Card', 'Bank', 'USSD', 'Mobile Money', 'Transfer'].map((method) => (
                  <div key={method} className="text-center">
                    <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-2">
                      <Zap className="w-6 h-6 mx-auto text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{method}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Recent Deposits */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Deposits
              </h3>
              {recentDeposits.length > 0 ? (
                <div className="space-y-3">
                  {recentDeposits.map((deposit) => (
                    <div key={deposit.id} className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatCurrency(deposit.amount)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(deposit.createdAt)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        deposit.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : deposit.status === 'pending'
                          ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                      }`}>
                        {deposit.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  No recent deposits
                </p>
              )}
            </div>

            {/* Help & Support */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-3">
                Need Help?
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400 mb-4">
                Having trouble with your deposit? Our support team is here to help.
              </p>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaystackDeposit;
'use client'
import React, { useState, useEffect, Suspense } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft, Home, RefreshCw, Wallet } from 'lucide-react';

// Loading fallback component
const CallbackLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
    <div className="max-w-md w-full">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we process your request...</p>
        </div>
      </div>
    </div>
  </div>
);

// Inner component that actually reads the URL params
const PaymentCallbackInner = () => {
  const [status, setStatus] = useState('verifying');
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(5);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Only access window object on client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference') || urlParams.get('trxref');
      
      if (reference) {
        verifyPayment(reference);
      } else {
        setStatus('error');
        setError('No payment reference found');
      }
    }
  }, []);

  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      handleRedirect('/wallet');
    }
  }, [status, countdown]);

  const verifyPayment = async (reference) => {
    try {
      setStatus('verifying');
      setError(null);

      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      
      if (!token) {
        setStatus('error');
        setError('Authentication required. Please log in.');
        return;
      }
      
      const response = await fetch(`/api/payments/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('success');
        setPaymentData(data.data);
        
        if (data.data.newBalance && typeof window !== 'undefined') {
          localStorage.setItem('walletBalance', data.data.newBalance);
        }
        
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'purchase', {
            transaction_id: reference,
            value: data.data.amount,
            currency: 'GHS'
          });
        }
      } else {
        if (data.data?.status === 'completed' && retryCount === 0) {
          setStatus('success');
          setPaymentData(data.data);
        } else {
          setStatus('failed');
          setError(data.message || 'Payment verification failed');
          setPaymentData(data.data);
        }
      }
    } catch (err) {
      console.error('Verification error:', err);
      
      if (retryCount < 1) {
        setRetryCount(retryCount + 1);
        setTimeout(() => verifyPayment(reference), 2000);
      } else {
        setStatus('error');
        setError('Unable to verify payment. Please check your transaction history.');
      }
    }
  };

  const handleRedirect = (path) => {
    if (typeof window !== 'undefined') {
      window.location.href = path;
    }
  };

  const retryVerification = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference') || urlParams.get('trxref');
      if (reference) {
        setRetryCount(0);
        verifyPayment(reference);
      }
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-GH', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className={`h-2 ${
            status === 'success' ? 'bg-gradient-to-r from-green-400 to-green-600' :
            status === 'failed' ? 'bg-gradient-to-r from-red-400 to-red-600' :
            status === 'error' ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
            'bg-gradient-to-r from-blue-400 to-blue-600'
          }`} />

          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className={`relative ${status === 'verifying' ? 'animate-pulse' : ''}`}>
                {status === 'verifying' && (
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                  </div>
                )}
                {status === 'success' && (
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                )}
                {status === 'failed' && (
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-red-600" />
                  </div>
                )}
                {status === 'error' && (
                  <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-12 h-12 text-orange-600" />
                  </div>
                )}
              </div>
            </div>

            <div className="text-center mb-6">
              {status === 'verifying' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifying Payment</h2>
                  <p className="text-gray-600">Please wait while we confirm your transaction...</p>
                  <div className="mt-4 flex justify-center gap-1">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </>
              )}

              {status === 'success' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                  <p className="text-gray-600 mb-4">Your wallet has been funded successfully</p>
                  
                  {paymentData && (
                    <div className="bg-green-50 rounded-lg p-4 mb-4 text-left">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Amount:</span>
                          <span className="font-semibold text-green-700">{formatAmount(paymentData.amount)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Reference:</span>
                          <span className="text-sm font-mono text-gray-700">{paymentData.reference}</span>
                        </div>
                        {paymentData.newBalance !== undefined && (
                          <div className="flex justify-between items-center pt-2 border-t border-green-200">
                            <span className="text-sm text-gray-600">New Balance:</span>
                            <span className="font-bold text-green-700">{formatAmount(paymentData.newBalance)}</span>
                          </div>
                        )}
                        {paymentData.paidAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Time:</span>
                            <span className="text-sm text-gray-700">{formatDate(paymentData.paidAt)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    Redirecting to wallet in {countdown} seconds...
                  </div>
                </>
              )}

              {status === 'failed' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Failed</h2>
                  <p className="text-red-600 mb-4">{error || 'Your payment could not be completed'}</p>
                  
                  {paymentData && paymentData.reference && (
                    <div className="bg-red-50 rounded-lg p-4 mb-4 text-left">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Reference:</span>
                          <span className="text-sm font-mono text-gray-700">{paymentData.reference}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status:</span>
                          <span className="text-sm text-red-600 capitalize">{paymentData.status || 'Failed'}</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-sm text-gray-600">
                    Please try again or contact support if the issue persists.
                  </p>
                </>
              )}

              {status === 'error' && (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Verification Error</h2>
                  <p className="text-orange-600 mb-4">{error}</p>
                  <p className="text-sm text-gray-600">
                    Please check your transaction history or contact support.
                  </p>
                </>
              )}
            </div>

            <div className="space-y-3">
              {status === 'success' && (
                <>
                  <button
                    onClick={() => handleRedirect('/wallet')}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    <Wallet className="w-5 h-5" />
                    Go to Wallet
                  </button>
                  <button
                    onClick={() => handleRedirect('/dashboard')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Go to Dashboard
                  </button>
                </>
              )}

              {status === 'failed' && (
                <>
                  <button
                    onClick={retryVerification}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-5 h-5" />
                    Retry Verification
                  </button>
                  <button
                    onClick={() => handleRedirect('/wallet')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    Try Another Payment
                  </button>
                </>
              )}

              {status === 'error' && (
                <>
                  <button
                    onClick={() => handleRedirect('/transactions')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
                  >
                    View Transaction History
                  </button>
                  <button
                    onClick={() => handleRedirect('/dashboard')}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Back to Dashboard
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <a href="/support" className="text-blue-600 hover:text-blue-700 font-medium">
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

// Client-only wrapper to prevent SSR issues
const ClientOnly = ({ children }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return <CallbackLoader />;
  }

  return children;
};

// Main component with Suspense boundary
const PaymentCallback = () => {
  return (
    <ClientOnly>
      <Suspense fallback={<CallbackLoader />}>
        <PaymentCallbackInner />
      </Suspense>
    </ClientOnly>
  );
};

export default PaymentCallback;
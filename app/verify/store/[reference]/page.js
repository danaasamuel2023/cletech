// app/store/verify/[reference]/page.js
'use client';

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, XCircle, Loader2, AlertCircle, 
  ArrowLeft, MessageCircle, ShoppingBag, RefreshCw,
  Home, Receipt, Phone, Clock
} from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentVerification() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const reference = params.reference;
  const subdomain = searchParams.get('subdomain'); // Get subdomain from query params
  
  const [status, setStatus] = useState('verifying');
  const [purchaseData, setPurchaseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (reference) {
      verifyPayment();
    } else {
      setStatus('error');
      setErrorMessage('No payment reference found');
    }
  }, [reference]);

  // Auto-redirect countdown for success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      // Redirect to appropriate store
      const storeSubdomain = subdomain || purchaseData?.subdomain || extractSubdomainFromData();
      if (storeSubdomain) {
        router.push(`/store/${storeSubdomain}`);
      } else {
        router.push('/');
      }
    }
  }, [status, countdown, router, subdomain]);

  const extractSubdomainFromData = () => {
    // Try to get subdomain from stored data
    const pendingPurchase = localStorage.getItem('pendingPurchase');
    if (pendingPurchase) {
      try {
        const data = JSON.parse(pendingPurchase);
        return data.subdomain;
      } catch (e) {
        console.error('Error parsing pending purchase:', e);
      }
    }
    return null;
  };

  const verifyPayment = async () => {
    try {
      setStatus('verifying');
      
      // Retrieve and merge stored purchase data
      const storedData = localStorage.getItem('pendingPurchase');
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          setPurchaseData(parsed);
        } catch (e) {
          console.error('Error parsing stored data:', e);
        }
      }

      // Add delay to ensure webhook has processed (optional)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call backend to verify payment
      const response = await fetch(`https://cletech-server.onrender.com/api/purchase/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add auth token if available
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        
        // Update purchase data with verification response
        setPurchaseData(prev => ({
          ...prev,
          ...data.data,
          subdomain: subdomain || prev?.subdomain // Preserve subdomain
        }));
        
        // Clear stored data
        localStorage.removeItem('pendingPurchase');
        
        // Start countdown for redirect
        setCountdown(10);
      } else {
        setStatus('failed');
        setErrorMessage(data.message || 'Payment verification failed');
      }
    } catch (error) {
      console.error('Verification error:', error);
      
      // Retry once after delay (webhook might not have processed yet)
      if (status === 'verifying') {
        setTimeout(() => {
          verifyPaymentRetry();
        }, 3000);
      } else {
        setStatus('error');
        setErrorMessage('Unable to verify payment. Please contact support.');
      }
    }
  };

  const verifyPaymentRetry = async () => {
    try {
      const response = await fetch(`https://cletech-server.onrender.com/api/purchase/verify/${reference}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setPurchaseData(prev => ({
          ...prev,
          ...data.data,
          subdomain: subdomain || prev?.subdomain
        }));
        localStorage.removeItem('pendingPurchase');
        setCountdown(10);
      } else {
        setStatus('failed');
        setErrorMessage(data.message || 'Payment verification failed');
      }
    } catch (error) {
      setStatus('error');
      setErrorMessage('Unable to verify payment. Please contact support.');
    }
  };

  const retryVerification = () => {
    setStatus('verifying');
    setErrorMessage('');
    verifyPayment();
  };

  const contactSupport = () => {
    const message = `Hi, I need help with my payment. Reference: ${reference}`;
    const whatsappNumber = purchaseData?.storeWhatsapp || '233000000000';
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  // Render different states
  if (status === 'verifying') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Payment</h1>
            <p className="text-gray-600">Please wait while we confirm your transaction...</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between py-2 text-sm">
              <span className="text-gray-500">Reference:</span>
              <span className="font-mono text-gray-700">{reference?.substring(0, 20)}...</span>
            </div>
            {purchaseData && (
              <>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-500">Amount:</span>
                  <span className="font-semibold text-gray-900">GH₵ {purchaseData.amount}</span>
                </div>
                <div className="flex items-center justify-between py-2 text-sm">
                  <span className="text-gray-500">Phone:</span>
                  <span className="text-gray-700">{purchaseData.phoneNumber}</span>
                </div>
              </>
            )}
          </div>

          <div className="mt-6 text-xs text-gray-500">
            <Clock className="w-4 h-4 inline mr-1" />
            This may take a few seconds...
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          {/* Success Animation */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600">Your data bundle purchase has been confirmed</p>
          </div>

          {/* Purchase Details */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-gray-600" />
              Transaction Details
            </h3>
            <div className="space-y-2 text-sm">
              {purchaseData && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <span className="font-medium text-gray-900">{purchaseData.network}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bundle:</span>
                    <span className="font-medium text-gray-900">{purchaseData.capacity}GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone Number:</span>
                    <span className="font-medium text-gray-900">{purchaseData.phoneNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-bold text-green-600 text-lg">GH₵ {purchaseData.amount}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="text-gray-600">Status:</span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Processing
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Delivery Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Data Bundle Delivery</p>
                <p className="text-blue-700">
                  Your data bundle will be delivered to {purchaseData?.phoneNumber} within 2-5 minutes. 
                  You'll receive an SMS confirmation once it's activated.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link 
              href={`/store/${subdomain || purchaseData?.subdomain || 'home'}`}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Continue Shopping
            </Link>

            <button
              onClick={contactSupport}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Contact Support on WhatsApp
            </button>
          </div>

          {/* Auto-redirect notice */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Redirecting to store in {countdown} seconds...
          </div>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-12 h-12 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600">{errorMessage || 'Your payment could not be processed'}</p>
          </div>

          {/* Error Details */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">What happened?</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• The payment was declined or cancelled</li>
              <li>• There might be insufficient funds</li>
              <li>• The transaction timed out</li>
            </ul>
          </div>

          {/* Purchase Info */}
          {purchaseData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Order Details</h3>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Bundle:</span>
                  <span className="text-gray-900">{purchaseData.capacity}GB {purchaseData.network}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-gray-900">GH₵ {purchaseData.amount}</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={retryVerification}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Retry Verification
            </button>

            <Link 
              href={`/store/${subdomain || purchaseData?.subdomain || 'home'}`}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Store
            </Link>

            <button
              onClick={contactSupport}
              className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              <Phone className="w-5 h-5 mr-2" />
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something Went Wrong</h1>
          <p className="text-gray-600">{errorMessage || 'We encountered an error processing your request'}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={retryVerification}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Try Again
          </button>

          <Link 
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
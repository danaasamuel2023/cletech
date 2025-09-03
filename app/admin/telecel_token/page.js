'use client';
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RefreshCw, Key, Clock, Shield, Send, History, Eye, EyeOff } from 'lucide-react';

const TelecelTokenManager = () => {
  const [tokenStatus, setTokenStatus] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [step, setStep] = useState('idle'); // idle, otp-requested, refreshing
  const [tokenHistory, setTokenHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Get auth token from localStorage
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    console.log('[TELECEL UI] Auth token present:', !!token);
    
    if (!token) {
      console.error('[TELECEL UI] No auth token found in localStorage');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Check token status on component mount
  useEffect(() => {
    checkTokenStatus();
    const interval = setInterval(checkTokenStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkTokenStatus = async () => {
    try {
      console.log('[TELECEL UI] Checking token status...');
      
      const response = await fetch('https://cletech-server.onrender.com/api/admin/telecel/token/status', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('[TELECEL UI] Status response:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('[TELECEL UI] Status check failed:', errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[TELECEL UI] Token status data:', data);
      setTokenStatus(data);

      // Auto-show warning if token needs refresh
      if (data.needsRefresh || data.status === 'expired') {
        setMessage({
          type: 'warning',
          text: data.status === 'expired' ? 
            'Token has expired! Please refresh immediately.' : 
            'Token expiring soon. Please refresh.'
        });
      }
    } catch (error) {
      console.error('[TELECEL UI] Failed to check token status:', error);
      
      if (error.message.includes('401')) {
        setMessage({ 
          type: 'error', 
          text: 'Authentication failed. Please refresh the page and login again.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: 'Failed to check token status. Please check your connection.' 
        });
      }
    }
  };

  const requestOTP = async () => {
    setLoading(true);
    setMessage(null);
    
    try {
      console.log('[TELECEL UI] Requesting OTP...');
      
      const response = await fetch('https://cletech-server.onrender.com/api/admin/telecel/token/request-otp', {
        method: 'POST',
        headers: getAuthHeaders()
      });

      console.log('[TELECEL UI] OTP request response:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[TELECEL UI] OTP request failed:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[TELECEL UI] OTP response data:', data);
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: 'OTP sent successfully! Check phone 059****4147 for the code.' 
        });
        setStep('otp-requested');
        
        // Start 5-minute countdown for OTP expiry
        setTimeout(() => {
          if (step === 'otp-requested') {
            setMessage({ 
              type: 'warning', 
              text: 'OTP may have expired. Request a new one if needed.' 
            });
          }
        }, 300000); // 5 minutes
      } else {
        throw new Error(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('[TELECEL UI] OTP request error:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to send OTP. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setMessage({ type: 'error', text: 'Please enter a valid 6-digit OTP code' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      console.log('[TELECEL UI] Refreshing token with OTP...');
      
      const response = await fetch('https://cletech-server.onrender.com/api/admin/telecel/token/refresh', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ otpCode })
      });

      console.log('[TELECEL UI] Refresh response:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[TELECEL UI] Token refresh failed:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[TELECEL UI] Token refresh data:', data);
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Token refreshed successfully! Valid until ${formatDate(data.expiresAt)}` 
        });
        setStep('idle');
        setOtpCode('');
        
        // Refresh status immediately
        await checkTokenStatus();
        
        // Load updated history
        if (showHistory) {
          await loadTokenHistory();
        }
      } else {
        throw new Error(data.message || 'Failed to refresh token');
      }
    } catch (error) {
      console.error('[TELECEL UI] Token refresh error:', error);
      
      if (error.message.includes('401')) {
        setMessage({ 
          type: 'error', 
          text: 'Invalid OTP code. Please check and try again.' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: error.message || 'Failed to refresh token. Please check OTP and try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const loadTokenHistory = async () => {
    try {
      console.log('[TELECEL UI] Loading token history...');
      
      const response = await fetch('https://cletech-server.onrender.com/api/admin/telecel/token/history', {
        method: 'GET',
        headers: getAuthHeaders()
      });

      console.log('[TELECEL UI] History response:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('[TELECEL UI] Token history data:', data);
      setTokenHistory(data);
    } catch (error) {
      console.error('[TELECEL UI] Failed to load token history:', error);
      setMessage({ 
        type: 'error', 
        text: 'Failed to load token history' 
      });
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
    if (!showHistory && tokenHistory.length === 0) {
      loadTokenHistory();
    }
  };

  const getStatusColor = () => {
    if (!tokenStatus) return 'gray';
    if (tokenStatus.status === 'expired') return 'red';
    if (tokenStatus.status === 'no_token') return 'red';
    if (tokenStatus.hoursRemaining <= 2) return 'yellow';
    return 'green';
  };

  const getStatusIcon = () => {
    const color = getStatusColor();
    if (color === 'red') return <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />;
    if (color === 'yellow') return <Clock className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />;
    return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const maskToken = (token) => {
    if (!token) return '';
    if (token.length <= 20) return '***';
    return `${token.substring(0, 10)}...${token.substring(token.length - 10)}`;
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setMessage({ type: 'success', text: 'Token copied to clipboard!' });
      setTimeout(() => setMessage(null), 2000);
    });
  };

  const testConnection = async () => {
    try {
      console.log('[TELECEL UI] Testing connection...');
      const response = await fetch('https://cletech-server.onrender.com/api/admin/telecel/test', {
        method: 'GET',
        headers: getAuthHeaders()
      });
      
      const data = await response.json();
      console.log('[TELECEL UI] Test response:', data);
      
      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Connected! Logged in as: ${data.user.email} (${data.user.role})` 
        });
      } else {
        setMessage({ type: 'error', text: 'Connection test failed' });
      }
    } catch (error) {
      console.error('[TELECEL UI] Connection test error:', error);
      setMessage({ type: 'error', text: 'Failed to connect to backend' });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-500 dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Telecel Token Manager</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={testConnection}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-xs text-gray-500 dark:text-gray-400"
              title="Test Backend Connection"
            >
              Test
            </button>
            <button
              onClick={toggleHistory}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="View History"
            >
              <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={checkTokenStatus}
              disabled={loading}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Refresh Status"
            >
              <RefreshCw className={`w-5 h-5 text-gray-600 dark:text-gray-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        {/* Status Card */}
        {tokenStatus && (
          <div className={`p-4 rounded-lg border-2 ${
            getStatusColor() === 'red' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' :
            getStatusColor() === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' :
            'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          }`}>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  {getStatusIcon()}
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    Status: {
                      tokenStatus.status === 'active' ? 'Active' : 
                      tokenStatus.status === 'expired' ? 'Expired' : 
                      tokenStatus.status === 'no_token' ? 'No Token Configured' :
                      'Unknown'
                    }
                  </span>
                </div>
                
                {tokenStatus.status === 'active' && (
                  <>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Expires: {formatDate(tokenStatus.expiresAt)}
                    </p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      Time remaining: {tokenStatus.hoursRemaining > 0 ? 
                        `${tokenStatus.hoursRemaining} hours` : 
                        'Less than 1 hour'}
                    </p>
                    
                    {/* Show token (masked) with toggle */}
                    {tokenStatus.token && (
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Token:</span>
                        <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-800 dark:text-gray-200">
                          {showToken ? tokenStatus.token : maskToken(tokenStatus.token)}
                        </code>
                        <button
                          onClick={() => setShowToken(!showToken)}
                          className="p-1"
                          title={showToken ? 'Hide token' : 'Show token'}
                        >
                          {showToken ? 
                            <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : 
                            <Eye className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          }
                        </button>
                        {showToken && (
                          <button
                            onClick={() => copyToClipboard(tokenStatus.token)}
                            className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Copy
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {tokenStatus.lastError && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Last error: {tokenStatus.lastError.message} 
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      ({formatDate(tokenStatus.lastError.occurredAt)})
                    </span>
                  </p>
                )}
              </div>
              
              {tokenStatus.needsRefresh && (
                <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded-full">
                  Refresh Soon
                </span>
              )}
              
              {tokenStatus.status === 'expired' && (
                <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 text-xs font-medium rounded-full">
                  Action Required
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Token Refresh Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <Key className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          Refresh Token
        </h2>

        {/* Message Alert */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'error' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300' : 
            message.type === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300' :
            'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300'
          }`}>
            {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : 
             message.type === 'warning' ? <Clock className="w-4 h-4" /> :
             <CheckCircle className="w-4 h-4" />}
            <span className="flex-1">{message.text}</span>
            <button 
              onClick={() => setMessage(null)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}

        <div className="space-y-4">
          {/* Step 1: Request OTP */}
          {step === 'idle' && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Click below to request an OTP code. It will be sent to the registered Telecel phone number (059****4147).
              </p>
              <button
                onClick={requestOTP}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending OTP...' : 'Request OTP'}
              </button>
            </div>
          )}

          {/* Step 2: Enter OTP */}
          {step === 'otp-requested' && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Enter OTP Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-center text-lg font-mono tracking-wider"
                    maxLength="6"
                    autoFocus
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">
                    {otpCode.length}/6
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Enter the 6-digit code sent to 059****4147
                </p>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={refreshToken}
                  disabled={loading || otpCode.length !== 6}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 dark:bg-green-600 text-white rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4" />
                  {loading ? 'Refreshing Token...' : 'Refresh Token'}
                </button>
                <button
                  onClick={requestOTP}
                  disabled={loading}
                  className="px-4 py-2 border border-blue-500 dark:border-blue-400 text-blue-500 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors disabled:opacity-50"
                >
                  Resend OTP
                </button>
                <button
                  onClick={() => {
                    setStep('idle');
                    setOtpCode('');
                    setMessage(null);
                  }}
                  disabled={loading}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Token History */}
      {showHistory && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            Token History
          </h2>
          
          {tokenHistory.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Created</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Expires</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Refreshed By</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Uses</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {tokenHistory.map((item, index) => (
                    <tr key={item._id || index}>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{formatDate(item.expiresAt)}</td>
                      <td className="px-4 py-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                        {item.lastRefreshedBy?.name || 'System'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.refreshCount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-sm">No token history available</p>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-4">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">How Token Refresh Works:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800 dark:text-blue-200">
          <li>Click "Request OTP" to receive a verification code via SMS</li>
          <li>Enter the 6-digit OTP code you receive on 059****4147</li>
          <li>Click "Refresh Token" to authenticate and get a new 12-hour token</li>
          <li>The system will automatically use the new token for all bundle transactions</li>
        </ol>
        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Important:</strong> Refresh the token before it expires to avoid service interruption. 
            The system will warn you when less than 2 hours remain.
          </p>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">System Configuration:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500 dark:text-gray-400">Account Email:</span>
            <p className="font-mono text-gray-800 dark:text-gray-100">danaasamuel20frimpong@gmail.com</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Registered Phone:</span>
            <p className="font-mono text-gray-800 dark:text-gray-100">059****4147</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">Subscriber MSISDN:</span>
            <p className="font-mono text-gray-800 dark:text-gray-100">233509240147</p>
          </div>
          <div>
            <span className="text-gray-500 dark:text-gray-400">API Endpoint:</span>
            <p className="font-mono text-gray-800 dark:text-gray-100">play.telecel.com.gh</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TelecelTokenManager;
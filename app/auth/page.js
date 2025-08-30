'use client'
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Phone, UserPlus, LogIn, Sparkles, Shield, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  
  const [loginData, setLoginData] = useState({
    emailOrPhone: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    referredBy: ''
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://cletech-server.onrender.com/api/auth';

  // Clear errors when switching tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMessage({ type: '', text: '' });
    setFieldErrors({});
  };

  // Clear field error when user starts typing
  const handleFieldChange = (form, field, value) => {
    if (form === 'login') {
      setLoginData({ ...loginData, [field]: value });
    } else {
      setSignupData({ ...signupData, [field]: value });
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setFieldErrors({});
    
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Login successful! Redirecting...' });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errors = {};
          data.errors.forEach(error => {
            errors[error.field] = error.message;
          });
          setFieldErrors(errors);
          setMessage({ type: 'error', text: 'Please fix the errors below' });
        } else if (data.field) {
          // Single field error
          setFieldErrors({ [data.field]: data.message });
          setMessage({ type: 'error', text: data.message });
        } else {
          setMessage({ type: 'error', text: data.message || 'Login failed' });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    setFieldErrors({});
    
    // Client-side validation
    if (signupData.password !== signupData.confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      setMessage({ type: 'error', text: 'Please fix the errors below' });
      setLoading(false);
      return;
    }

    // Basic phone number format validation
    const phoneRegex = /^(\+233|0)[2-9]\d{8}$/;
    if (!phoneRegex.test(signupData.phoneNumber)) {
      setFieldErrors({ phoneNumber: 'Please provide a valid Ghana phone number (e.g., 0241234567)' });
      setMessage({ type: 'error', text: 'Please fix the errors below' });
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessage({ type: 'success', text: 'Registration successful! Redirecting...' });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        // Handle validation errors
        if (data.errors && Array.isArray(data.errors)) {
          const errors = {};
          data.errors.forEach(error => {
            errors[error.field] = error.message;
          });
          setFieldErrors(errors);
          setMessage({ type: 'error', text: 'Please fix the errors below' });
        } else if (data.field) {
          // Single field error (like duplicate email/phone)
          setFieldErrors({ [data.field]: data.message });
          setMessage({ type: 'error', text: data.message });
        } else {
          setMessage({ type: 'error', text: data.message || 'Registration failed' });
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Main container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-lg rounded-full mb-4 border border-white/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Clenet</h1>
          <p className="text-white/80 text-sm">Secure. Fast. Reliable.</p>
        </div>

        {/* Auth card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Tab navigation */}
          <div className="flex relative">
            <button
              onClick={() => handleTabChange('login')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                activeTab === 'login' 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LogIn size={20} />
                <span>Login</span>
              </div>
            </button>
            <button
              onClick={() => handleTabChange('signup')}
              className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${
                activeTab === 'signup' 
                  ? 'text-white' 
                  : 'text-white/60 hover:text-white/80'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <UserPlus size={20} />
                <span>Sign Up</span>
              </div>
            </button>
            <div 
              className="absolute bottom-0 h-1 bg-white rounded-full transition-all duration-300"
              style={{
                width: '50%',
                left: activeTab === 'login' ? '0' : '50%'
              }}
            />
          </div>

          {/* Message display */}
          {message.text && (
            <div className={`mx-6 mt-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-500/20 text-green-100 border border-green-400/30' 
                : 'bg-red-500/20 text-red-100 border border-red-400/30'
            }`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
          )}

          {/* Forms container */}
          <div className="p-6">
            {/* Login Form */}
            {activeTab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type="text"
                      placeholder="Email or Phone Number"
                      value={loginData.emailOrPhone}
                      onChange={(e) => handleFieldChange('login', 'emailOrPhone', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                        fieldErrors.emailOrPhone 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : 'border-white/20 focus:border-white/40'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.emailOrPhone && (
                    <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                      <XCircle size={12} />
                      {fieldErrors.emailOrPhone}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password"
                      value={loginData.password}
                      onChange={(e) => handleFieldChange('login', 'password', e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                        fieldErrors.password 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : 'border-white/20 focus:border-white/40'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                      <XCircle size={12} />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Logging in...
                    </span>
                  ) : (
                    'Login'
                  )}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={signupData.name}
                      onChange={(e) => handleFieldChange('signup', 'name', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                        fieldErrors.name 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : 'border-white/20 focus:border-white/40'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                      <XCircle size={12} />
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={signupData.email}
                      onChange={(e) => handleFieldChange('signup', 'email', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                        fieldErrors.email 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : 'border-white/20 focus:border-white/40'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                      <XCircle size={12} />
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type="tel"
                      placeholder="Phone Number (e.g., 0241234567)"
                      value={signupData.phoneNumber}
                      onChange={(e) => handleFieldChange('signup', 'phoneNumber', e.target.value)}
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                        fieldErrors.phoneNumber 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : 'border-white/20 focus:border-white/40'
                      }`}
                      required
                    />
                  </div>
                  {fieldErrors.phoneNumber && (
                    <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                      <XCircle size={12} />
                      {fieldErrors.phoneNumber}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Password (min 6 chars with 1 number)"
                      value={signupData.password}
                      onChange={(e) => handleFieldChange('signup', 'password', e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                        fieldErrors.password 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : 'border-white/20 focus:border-white/40'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                      <XCircle size={12} />
                      {fieldErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm Password"
                      value={signupData.confirmPassword}
                      onChange={(e) => handleFieldChange('signup', 'confirmPassword', e.target.value)}
                      className={`w-full pl-12 pr-12 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                        fieldErrors.confirmPassword 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : 'border-white/20 focus:border-white/40'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                      <XCircle size={12} />
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
                    <input
                      type="text"
                      placeholder="Referral Code (Optional)"
                      value={signupData.referredBy}
                      onChange={(e) => handleFieldChange('signup', 'referredBy', e.target.value.toUpperCase())}
                      maxLength={6}
                      className={`w-full pl-12 pr-4 py-3 bg-white/10 border rounded-xl text-white placeholder-white/50 focus:outline-none focus:bg-white/15 transition-all ${
                        fieldErrors.referredBy 
                          ? 'border-red-400/50 focus:border-red-400' 
                          : 'border-white/20 focus:border-white/40'
                      }`}
                    />
                  </div>
                  {fieldErrors.referredBy && (
                    <p className="mt-1 text-xs text-red-300 flex items-center gap-1">
                      <XCircle size={12} />
                      {fieldErrors.referredBy}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-white/60 text-sm">
          <p>© 2025 Clenet. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
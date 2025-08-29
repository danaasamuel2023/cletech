// components/Navbar.jsx - Updated with Purchase URL Parameters
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Menu, X, ChevronDown, User, 
  LogIn, UserPlus, Bell, Settings, LogOut, 
  TrendingUp, Wallet, FileCheck, GraduationCap,
  Database, Building2, HelpCircle, BarChart3
} from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    window.location.href = '/';
  };

  const services = [
    { name: 'MTN Data', href: '/purchase?network=MTN' },
    { name: 'Telecel Data', href: '/purchase?network=TELECEL' },
    { name: 'AirtelTigo Data', href: '/purchase?network=AT' },
    { name: 'Yello Data', href: '/purchase?network=YELLO' },
    { name: 'Bulk Purchase', href: '/purchase?bulk=true' },
    { name: 'API Integration', href: '/api' },
  ];

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white shadow-lg' 
          : 'bg-white/95 backdrop-blur-sm shadow-md'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                CLETECH
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link href="/" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Home
              </Link>

              {/* Services Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  onMouseEnter={() => setIsServicesOpen(true)}
                  onMouseLeave={() => setIsServicesOpen(false)}
                  className="flex items-center text-gray-700 hover:text-purple-600 font-medium transition-colors"
                >
                  Services
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isServicesOpen && (
                  <div 
                    className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl"
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                  >
                    {services.map((service, index) => (
                      <Link
                        key={index}
                        href={service.href}
                        className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors first:rounded-t-lg last:rounded-b-lg"
                      >
                        {service.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Result Checker Link */}
              <Link href="/result-checker" className="flex items-center text-gray-700 hover:text-purple-600 font-medium transition-colors">
                <GraduationCap className="w-4 h-4 mr-1" />
                Result Checker
              </Link>

              <Link href="/agents" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Become an Agent
              </Link>

              <Link href="/about" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                About
              </Link>

              <Link href="/contact" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Contact
              </Link>
            </div>

            {/* Right Section */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Notification Bell for logged in users */}
              {isLoggedIn && (
                <button className="relative p-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>
              )}

              {/* User Menu or Auth Buttons */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <span className="font-medium">{user?.name || 'Account'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl">
                      <div className="py-2">
                        <Link href="/api_keys" className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                          <BarChart3 className="w-4 h-4 mr-3" />
                          api_keys
                        </Link>
                        <Link href="/wallet" className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                          <Wallet className="w-4 h-4 mr-3" />
                          Wallet
                        </Link>
                        <Link href="/transactions" className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                          <TrendingUp className="w-4 h-4 mr-3" />
                          Transactions
                        </Link>
                        <Link href="/profile" className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                          <User className="w-4 h-4 mr-3" />
                          Profile
                        </Link>
                        <hr className="my-2 border-gray-200" />
                        <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                          <LogOut className="w-4 h-4 mr-3" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link href="/auth" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                    Login
                  </Link>
                  <Link href="/auth" className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-purple-600 transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`lg:hidden transition-all duration-300 ${
          isMobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}>
          <div className="bg-white border-t border-gray-200">
            <div className="px-4 py-4 space-y-1">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                Home
              </Link>
              
              <div className="px-3 py-2">
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Services</p>
                {services.map((service, index) => (
                  <Link
                    key={index}
                    href={service.href}
                    className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors"
                  >
                    {service.name}
                  </Link>
                ))}
              </div>

              <Link href="/result-checker" className="flex items-center px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                <GraduationCap className="w-4 h-4 mr-2" />
                Result Checker
              </Link>

              <Link href="/agents" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                Become an Agent
              </Link>

              <Link href="/about" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                About
              </Link>

              <Link href="/contact" className="block px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                Contact
              </Link>

              <hr className="my-2 border-gray-200" />

              {isLoggedIn ? (
                <>
                  <Link href="/api_keys" className="flex items-center px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Api_Keys
                  </Link>
                  <Link href="/wallet" className="flex items-center px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                    <Wallet className="w-4 h-4 mr-2" />
                    Wallet
                  </Link>
                  <Link href="/purchase" className="flex items-center px-3 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 rounded-lg transition-colors">
                    <Database className="w-4 h-4 mr-2" />
                    Buy Data
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center px-3 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 px-3 py-2">
                  <Link href="/auth" className="text-center px-4 py-2 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                    Login
                  </Link>
                  <Link href="/auth" className="text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-16"></div>
    </>
  );
};

export default Navbar;
// components/Navbar.jsx - Fixed spacing and removed Yello
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ChevronDown, User, 
  LogIn, UserPlus, Bell, Settings, LogOut, 
  TrendingUp, Wallet, FileCheck, GraduationCap,
  Database, Building2, HelpCircle, BarChart3,
  Sparkles, Zap, Shield, Crown, Rocket, Home, Info, Phone
} from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [activeLink, setActiveLink] = useState('/');

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

  // Close mobile menu when clicking a link
  const handleLinkClick = (href) => {
    setActiveLink(href);
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  };

  const services = [
    { 
      name: 'MTN Data', 
      href: '/purchase?network=MTN',
      icon: <Zap className="w-4 h-4" />,
      color: 'text-yellow-500',
      description: 'Fast & Reliable'
    },
    { 
      name: 'Telecel Data', 
      href: '/purchase?network=TELECEL',
      icon: <Rocket className="w-4 h-4" />,
      color: 'text-red-500',
      description: 'Premium Quality'
    },
    { 
      name: 'AirtelTigo Data', 
      href: '/purchase?network=AT',
      icon: <Shield className="w-4 h-4" />,
      color: 'text-blue-500',
      description: 'Best Coverage'
    },
    { 
      name: 'Bulk Purchase', 
      href: '/purchase?bulk=true',
      icon: <Database className="w-4 h-4" />,
      color: 'text-purple-500',
      description: 'Business Solutions'
    },
    { 
      name: 'API Integration', 
      href: '/api',
      icon: <BarChart3 className="w-4 h-4" />,
      color: 'text-indigo-500',
      description: 'For Developers'
    },
  ];

  // Mobile menu animation variants
  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1],
        staggerChildren: 0.05,
        when: "afterChildren"
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.4,
        ease: [0.4, 0.0, 0.2, 1],
        staggerChildren: 0.07,
        delayChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    closed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.2
      }
    },
    open: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  return (
    <>
      {/* Main Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-lg shadow-2xl border-b border-purple-100' 
          : 'bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-md shadow-lg'
      }`}>
        {/* Top Gradient Bar */}
        <div className="h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 animate-gradient-x"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo with Animation */}
            <Link 
              href="/" 
              onClick={() => handleLinkClick('/')}
              className="flex items-center space-x-2 group"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-3 py-1 rounded-lg">
                  <div className="text-2xl font-black tracking-tight flex items-center">
                    <Sparkles className="w-5 h-5 mr-1 animate-pulse" />
                    CLETECH
                  </div>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation - Fixed spacing */}
            <div className="hidden lg:flex items-center space-x-3">
              <NavLink 
                href="/" 
                label="Home" 
                icon={<Home className="w-4 h-4 mr-1.5" />}
                onClick={() => handleLinkClick('/')} 
                isActive={activeLink === '/'} 
              />

              {/* Only show Services dropdown if logged in */}
              {isLoggedIn && (
                <div className="relative">
                  <button
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                    className={`flex items-center px-5 py-2 rounded-lg font-medium transition-all duration-300 ${
                      activeLink.includes('purchase') 
                        ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Database className="w-4 h-4 mr-1.5" />
                    Services
                    <ChevronDown className={`w-4 h-4 ml-1.5 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  <AnimatePresence>
                    {isServicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                        className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden"
                        onMouseEnter={() => setIsServicesOpen(true)}
                        onMouseLeave={() => setIsServicesOpen(false)}
                      >
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 border-b border-gray-100">
                          <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Our Services</p>
                        </div>
                        {services.map((service, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Link
                              href={service.href}
                              onClick={() => handleLinkClick(service.href)}
                              className="group flex items-center px-4 py-3 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-200"
                            >
                              <div className={`${service.color} mr-3 group-hover:scale-110 transition-transform`}>
                                {service.icon}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-800 group-hover:text-purple-700 transition-colors">
                                  {service.name}
                                </div>
                                <div className="text-xs text-gray-500">{service.description}</div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Only show these links if logged in */}
              {isLoggedIn && (
                <>
                  <NavLink 
                    href="/result-checker" 
                    label="Result Checker" 
                    icon={<GraduationCap className="w-4 h-4 mr-1.5" />}
                    onClick={() => handleLinkClick('/result-checker')}
                    isActive={activeLink === '/result-checker'}
                  />
                  
                  <NavLink 
                    href="/store_management" 
                    label="Store" 
                    icon={<Building2 className="w-4 h-4 mr-1.5" />}
                    onClick={() => handleLinkClick('/store_management')}
                    isActive={activeLink === '/store_management'}
                  />
                  
                  <NavLink 
                    href="/agents" 
                    label="Become an Agent" 
                    onClick={() => handleLinkClick('/agents')}
                    isActive={activeLink === '/agents'}
                    highlight
                  />
                </>
              )}
            </div>

            {/* Right Section - Added more spacing */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Notification Bell */}
              {isLoggedIn && (
                <motion.button 
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                >
                  <Bell className="w-5 h-5" />
                  <motion.span 
                    className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                </motion.button>
              )}

              {/* User Menu or Auth Buttons */}
              {isLoggedIn ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 rounded-lg transition-all border border-purple-200"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-800">{user?.name || 'Account'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                  </motion.button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        transition={{ duration: 0.2, ease: [0.4, 0.0, 0.2, 1] }}
                        className="absolute top-full right-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden"
                      >
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-3 border-b border-gray-100">
                          <p className="text-xs font-semibold text-purple-700">Account Menu</p>
                        </div>
                        <div className="py-2">
                          <MenuLink href="/api_keys" icon={<BarChart3 />} label="API Keys" onClick={() => handleLinkClick('/api_keys')} />
                          <MenuLink href="/wallet" icon={<Wallet />} label="Wallet" onClick={() => handleLinkClick('/wallet')} />
                          <MenuLink href="/transactions" icon={<TrendingUp />} label="Transactions" onClick={() => handleLinkClick('/transactions')} />
                          <MenuLink href="/profile" icon={<User />} label="Profile" onClick={() => handleLinkClick('/profile')} />
                          <hr className="my-2 border-gray-100" />
                          <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <LogOut className="w-4 h-4 mr-3" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link 
                      href="/auth" 
                      onClick={() => handleLinkClick('/auth')}
                      className="px-5 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                    >
                      Login
                    </Link>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link 
                      href="/auth" 
                      onClick={() => handleLinkClick('/auth')}
                      className="relative inline-flex items-center px-6 py-2.5 overflow-hidden font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg group"
                    >
                      <span className="absolute w-32 h-32 -mt-12 -ml-12 bg-white opacity-30 rounded-full blur-lg"></span>
                      <motion.span 
                        className="absolute w-32 h-32 -mt-12 -ml-12 bg-white opacity-30 rounded-full blur-lg"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                      />
                      <span className="relative flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Get Started
                      </span>
                    </Link>
                  </motion.div>
                </>
              )}
            </div>

            {/* Mobile Menu Button with Animation */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
            >
              <motion.div
                animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu with Better Animations */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="lg:hidden overflow-hidden"
            >
              <motion.div 
                className="bg-white border-t border-gray-100"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="px-4 py-4 space-y-1">
                  <motion.div variants={itemVariants}>
                    <MobileLink href="/" label="Home" icon={<Home className="w-4 h-4 mr-2" />} onClick={() => handleLinkClick('/')} />
                  </motion.div>
                  
                  {/* Only show services if logged in */}
                  {isLoggedIn && (
                    <motion.div variants={itemVariants} className="px-3 py-2">
                      <p className="text-xs text-purple-600 uppercase tracking-wider mb-2 font-semibold">Services</p>
                      {services.map((service, index) => (
                        <motion.div
                          key={index}
                          variants={itemVariants}
                          custom={index}
                        >
                          <Link
                            href={service.href}
                            onClick={() => handleLinkClick(service.href)}
                            className="flex items-center px-3 py-2.5 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 rounded-lg transition-all mb-1"
                          >
                            <span className={`${service.color} mr-3`}>{service.icon}</span>
                            <div>
                              <div className="font-medium">{service.name}</div>
                              <div className="text-xs text-gray-500">{service.description}</div>
                            </div>
                          </Link>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {/* Conditionally show links based on login status */}
                  {isLoggedIn && (
                    <>
                      <motion.div variants={itemVariants}>
                        <MobileLink 
                          href="/result-checker" 
                          label="Result Checker" 
                          icon={<GraduationCap className="w-4 h-4 mr-2" />}
                          onClick={() => handleLinkClick('/result-checker')}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <MobileLink 
                          href="/store_management" 
                          label="Store Management" 
                          icon={<Building2 className="w-4 h-4 mr-2" />}
                          onClick={() => handleLinkClick('/store_management')}
                        />
                      </motion.div>
                      
                      <motion.div variants={itemVariants}>
                        <MobileLink 
                          href="/agents" 
                          label="Become an Agent" 
                          onClick={() => handleLinkClick('/agents')}
                          highlight
                        />
                      </motion.div>
                    </>
                  )}

                  <motion.hr variants={itemVariants} className="my-3 border-gray-100" />

                  {isLoggedIn ? (
                    <>
                      <motion.div variants={itemVariants}>
                        <MobileLink href="/api_keys" label="API Keys" icon={<BarChart3 className="w-4 h-4 mr-2" />} onClick={() => handleLinkClick('/api_keys')} />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <MobileLink href="/wallet" label="Wallet" icon={<Wallet className="w-4 h-4 mr-2" />} onClick={() => handleLinkClick('/wallet')} />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <MobileLink href="/purchase" label="Buy Data" icon={<Database className="w-4 h-4 mr-2" />} onClick={() => handleLinkClick('/purchase')} />
                      </motion.div>
                      <motion.div variants={itemVariants}>
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center px-3 py-2.5 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </motion.div>
                    </>
                  ) : (
                    <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2 px-3 py-2">
                      <Link 
                        href="/auth" 
                        onClick={() => handleLinkClick('/auth')}
                        className="text-center px-4 py-2.5 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium"
                      >
                        Login
                      </Link>
                      <Link 
                        href="/auth" 
                        onClick={() => handleLinkClick('/auth')}
                        className="text-center px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all font-medium"
                      >
                        Sign Up
                      </Link>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Spacer */}
      <div className="h-16"></div>

      {/* Add CSS for gradient animation */}
      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </>
  );
};

// Helper Components with improved spacing
const NavLink = ({ href, label, icon, onClick, isActive, highlight }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`
      flex items-center px-5 py-2 rounded-lg font-medium transition-all duration-300
      ${isActive 
        ? 'bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700' 
        : highlight 
          ? 'text-purple-600 hover:bg-purple-50 border border-purple-200'
          : 'text-gray-700 hover:bg-gray-100'
      }
    `}
  >
    {icon}
    {label}
  </Link>
);

const MobileLink = ({ href, label, icon, onClick, highlight }) => (
  <Link
    href={href}
    onClick={onClick}
    className={`
      flex items-center px-3 py-2.5 rounded-lg transition-all
      ${highlight 
        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-600 font-medium border border-purple-200'
        : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
      }
    `}
  >
    {icon}
    {label}
  </Link> 
);

const MenuLink = ({ href, icon, label, onClick }) => (
  <Link 
    href={href} 
    onClick={onClick}
    className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-colors"
  >
    {React.cloneElement(icon, { className: "w-4 h-4 mr-3" })}
    {label}
  </Link>
);

export default Navbar;
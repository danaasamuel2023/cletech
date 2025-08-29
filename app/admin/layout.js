// app/admin/layout.js - Updated with real data fetching
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, DollarSign, ShoppingCart, TrendingUp, 
  Package, Store, GraduationCap, Bell, Settings,
  BarChart3, Database, Shield, Menu, X, LogOut,
  ChevronRight, CreditCard, Key, MessageSquare,
  Wallet, FileText, Globe, Activity, ChevronDown,
  Sun, Moon, UserCheck
} from 'lucide-react';

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [badges, setBadges] = useState({
    totalUsers: null,
    pendingApprovals: null,
    pendingPurchases: null,
    totalStores: null,
    pendingStores: null,
    pendingWithdrawals: null,
    notifications: null
  });

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('adminTheme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    // Check admin authentication
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (!token || !userData) {
        router.push('/auth');
        return;
      }
      
      const parsedUser = JSON.parse(userData);
      if (parsedUser.role !== 'admin') {
        router.push('/');
        return;
      }
      
      setUser(parsedUser);
    };
    
    checkAuth();
  }, [router]);

  useEffect(() => {
    // Fetch badge counts
    const fetchBadgeCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch dashboard analytics for badge counts
        const response = await fetch('http://localhost:5000/api/admin/analytics/dashboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          
          setBadges({
            totalUsers: formatBadgeCount(data.data.users?.total?.[0]?.count || 0),
            pendingApprovals: data.data.users?.byStatus?.find(s => s._id === 'pending')?.count || 0,
            pendingPurchases: data.data.purchases?.byStatus?.find(s => s._id === 'pending')?.count || 0,
            totalStores: formatBadgeCount(data.data.stores?.total?.[0]?.count || 0),
            pendingStores: data.data.stores?.verified?.find(s => s.verificationStatus === 'pending')?.count || 0,
            pendingWithdrawals: 0, // You can add a specific endpoint for this
            notifications: 0 // You can add a specific endpoint for unread notifications
          });
        }
      } catch (error) {
        console.error('Error fetching badge counts:', error);
      }
    };

    fetchBadgeCounts();
    // Refresh badge counts every 60 seconds
    const interval = setInterval(fetchBadgeCounts, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper function to format large numbers
  const formatBadgeCount = (count) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1)}K`;
    }
    return count.toString();
  };

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('adminTheme', 'light');
      setDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('adminTheme', 'dark');
      setDarkMode(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth');
  };

  const toggleSubmenu = (menuId) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      href: '/admin',
      badge: null
    },
    {
      id: 'users',
      label: 'User Management',
      icon: <Users className="w-5 h-5" />,
      href: '/admin/users',
      badge: badges.totalUsers,
      submenu: [
        { label: 'All Users', href: '/admin/users' },
        { 
          label: 'Pending Approvals', 
          href: '/admin/users?filter=pending', 
          badge: badges.pendingApprovals > 0 ? badges.pendingApprovals : null 
        },
        { label: 'Agents', href: '/admin/users?role=agent' },
        { label: 'User Purchases', href: '/admin/users/purchases', icon: <UserCheck className="w-3 h-3" /> },
        { label: 'Add User', href: '/admin/users/add' }
      ]
    },
    {
      id: 'pricing',
      label: 'Pricing & Inventory',
      icon: <Database className="w-5 h-5" />,
      href: '/admin/pricing',
      submenu: [
        { label: 'Data Pricing', href: '/admin/pricing' },
        { label: 'Inventory Status', href: '/admin/pricing/inventory' },
        { label: 'Promotions', href: '/admin/pricing/promotions' }
      ]
    },
    {
      id: 'purchases',
      label: 'Purchases',
      icon: <ShoppingCart className="w-5 h-5" />,
      href: '/admin/purchases',
      badge: badges.pendingPurchases > 0 ? badges.pendingPurchases : null,
      submenu: [
        { label: 'All Purchases', href: '/admin/purchases' },
        { 
          label: 'Pending', 
          href: '/admin/purchases?status=pending', 
          badge: badges.pendingPurchases > 0 ? badges.pendingPurchases : null 
        },
        { label: 'Failed', href: '/admin/purchases?status=failed' },
        { label: 'Refunds', href: '/admin/purchases/refunds' }
      ]
    },
    {
      id: 'stores',
      label: 'Agent Stores',
      icon: <Store className="w-5 h-5" />,
      href: '/admin/stores',
      badge: badges.totalStores,
      submenu: [
        { label: 'All Stores', href: '/admin/stores' },
        { 
          label: 'Pending Verification', 
          href: '/admin/stores?status=pending', 
          badge: badges.pendingStores > 0 ? badges.pendingStores : null 
        },
        { label: 'Premium Stores', href: '/admin/stores?premium=true' },
        { label: 'Store Analytics', href: '/admin/stores/analytics' }
      ]
    },
    {
      id: 'results',
      label: 'Result Checkers',
      icon: <GraduationCap className="w-5 h-5" />,
      href: '/admin/results',
      submenu: [
        { label: 'WASSCE Cards', href: '/admin/results?type=wassce' },
        { label: 'BECE Cards', href: '/admin/results?type=bece' },
        { label: 'Add Cards', href: '/admin/results/add' },
        { label: 'Sales Report', href: '/admin/results/sales' }
      ]
    },
    {
      id: 'finance',
      label: 'Finance',
      icon: <DollarSign className="w-5 h-5" />,
      href: '/admin/finance',
      submenu: [
        { label: 'Transactions', href: '/admin/finance/transactions' },
        { label: 'Wallet Management', href: '/admin/finance/wallets' },
        { label: 'Agent Profits', href: '/admin/finance/profits' },
        { 
          label: 'Withdrawals', 
          href: '/admin/finance/withdrawals', 
          badge: badges.pendingWithdrawals > 0 ? badges.pendingWithdrawals : null 
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <BarChart3 className="w-5 h-5" />,
      href: '/admin/analytics',
      submenu: [
        { label: 'Revenue Report', href: '/admin/analytics/revenue' },
        { label: 'User Analytics', href: '/admin/analytics/users' },
        { label: 'Network Stats', href: '/admin/analytics/networks' },
        { label: 'Agent Performance', href: '/admin/analytics/agents' }
      ]
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="w-5 h-5" />,
      href: '/admin/notifications',
      badge: badges.notifications > 0 ? badges.notifications : null,
      submenu: [
        { label: 'Send Notification', href: '/admin/notifications/send' },
        { label: 'Templates', href: '/admin/notifications/templates' },
        { label: 'History', href: '/admin/notifications/history' }
      ]
    },
    {
      id: 'api',
      label: 'API Management',
      icon: <Key className="w-5 h-5" />,
      href: '/admin/api-keys',
      submenu: [
        { label: 'API Keys', href: '/admin/api-keys' },
        { label: 'Usage Stats', href: '/admin/api-keys/usage' },
        { label: 'Documentation', href: '/admin/api-keys/docs' }
      ]
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="w-5 h-5" />,
      href: '/admin/settings',
      submenu: [
        { label: 'General Settings', href: '/admin/settings' },
        { label: 'Maintenance Mode', href: '/admin/settings/maintenance' },
        { label: 'System Health', href: '/admin/settings/health' },
        { label: 'Backup & Restore', href: '/admin/settings/backup' }
      ]
    }
  ];

  const isActive = (href) => pathname === href;
  const isParentActive = (item) => {
    // Check for dynamic routes
    if (pathname.includes('/users/') && pathname.includes('/purchases') && item.id === 'users') {
      return true;
    }
    if (pathname === item.href) return true;
    if (item.submenu) {
      return item.submenu.some(sub => pathname === sub.href);
    }
    return false;
  };

  // Rest of the component remains the same...
  return (
    <div className={`min-h-screen flex ${darkMode ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex w-full">
        {/* Desktop Sidebar */}
        <aside className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } hidden lg:flex flex-col bg-white dark:bg-gray-800 border-r-2 border-gray-300 dark:border-gray-700 transition-all duration-300 shadow-lg`}>
          
          {/* Logo Section */}
          <div className="h-16 flex items-center justify-between px-4 border-b-2 border-gray-300 dark:border-gray-700 bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-900 dark:to-indigo-900">
            {sidebarOpen ? (
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white dark:bg-gray-200 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-700 dark:text-purple-900" />
                </div>
                <span className="text-xl font-bold text-white">
                  CLETECH
                </span>
              </Link>
            ) : (
              <div className="w-8 h-8 bg-white dark:bg-gray-200 rounded-lg flex items-center justify-center mx-auto">
                <Shield className="w-5 h-5 text-purple-700 dark:text-purple-900" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            >
              {sidebarOpen ? 
                <X className="w-5 h-5 text-white" /> : 
                <Menu className="w-5 h-5 text-white" />
              }
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-3 bg-gray-50 dark:bg-gray-800">
            {menuItems.map((item) => (
              <div key={item.id} className="mb-1">
                {/* Main Menu Item */}
                <div className="relative">
                  <Link
                    href={item.href}
                    onClick={(e) => {
                      if (item.submenu && sidebarOpen) {
                        e.preventDefault();
                        toggleSubmenu(item.id);
                      }
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-medium ${
                      isParentActive(item)
                        ? 'bg-purple-600 dark:bg-purple-700 text-white shadow-md'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {sidebarOpen && (
                        <span className="ml-3 text-sm font-semibold">{item.label}</span>
                      )}
                    </div>
                    {sidebarOpen && (
                      <div className="flex items-center">
                        {item.badge && (
                          <span className={`mr-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                            isParentActive(item) 
                              ? 'bg-white text-purple-700'
                              : 'bg-purple-700 dark:bg-purple-600 text-white'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                        {item.submenu && (
                          <ChevronDown className={`w-4 h-4 transition-transform ${
                            expandedMenus[item.id] ? 'rotate-180' : ''
                          }`} />
                        )}
                      </div>
                    )}
                  </Link>
                </div>

                {/* Submenu */}
                {sidebarOpen && item.submenu && expandedMenus[item.id] && (
                  <div className="mt-1 ml-8 space-y-1">
                    {item.submenu.map((subItem, index) => (
                      <Link
                        key={index}
                        href={subItem.href}
                        className={`flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all font-medium ${
                          isActive(subItem.href) || (subItem.href === '/admin/users/purchases' && pathname.includes('/users/') && pathname.includes('/purchases'))
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {subItem.icon && subItem.icon}
                          <span>{subItem.label}</span>
                        </div>
                        {subItem.badge && (
                          <span className="px-2 py-0.5 text-xs font-bold bg-orange-600 text-white rounded-full">
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-700 dark:bg-purple-600 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              {sidebarOpen && (
                <>
                  <div className="ml-3 flex-1">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-400">{user?.email || 'admin@cletech.com'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar - same structure with dynamic badges */}
        <div className={`lg:hidden fixed inset-0 z-50 ${mobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="fixed inset-0 bg-black bg-opacity-60" onClick={() => setMobileMenuOpen(false)} />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-2xl">
            {/* Mobile menu header */}
            <div className="h-16 flex items-center justify-between px-4 border-b-2 border-gray-300 dark:border-gray-700 bg-gradient-to-r from-purple-700 to-indigo-700 dark:from-purple-900 dark:to-indigo-900">
              <Link href="/admin" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white dark:bg-gray-200 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-700 dark:text-purple-900" />
                </div>
                <span className="text-xl font-bold text-white">
                  CLETECH ADMIN
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            
            {/* Mobile navigation */}
            <nav className="flex-1 overflow-y-auto py-4 px-3 bg-gray-50 dark:bg-gray-800">
              {menuItems.map((item) => (
                <div key={item.id} className="mb-1">
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all font-medium ${
                      isParentActive(item)
                        ? 'bg-purple-600 dark:bg-purple-700 text-white shadow-md'
                        : 'text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      <span className="ml-3 text-sm font-semibold">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        isParentActive(item) 
                          ? 'bg-white text-purple-700'
                          : 'bg-purple-700 dark:bg-purple-600 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </div>
              ))}
            </nav>

            {/* Mobile user section */}
            <div className="p-4 border-t-2 border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-700 dark:bg-purple-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-400">{user?.email || 'admin@cletech.com'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Header */}
          <header className="h-16 bg-white dark:bg-gray-800 border-b-2 border-gray-300 dark:border-gray-700 px-4 lg:px-6 shadow-sm">
            <div className="h-full flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <Menu className="w-5 h-5 text-gray-800 dark:text-gray-200" />
                </button>
                
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm ml-4">
                  <Link href="/admin" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium">
                    Admin
                  </Link>
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-gray-900 dark:text-white font-bold">
                    {pathname.includes('/users/') && pathname.includes('/purchases') 
                      ? 'User Purchases' 
                      : menuItems.find(item => isParentActive(item))?.label || 'Dashboard'}
                  </span>
                </nav>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-3">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleDarkMode}
                  className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-300 group"
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  <div className="relative w-5 h-5">
                    <Sun className={`w-5 h-5 absolute transition-all duration-300 ${
                      darkMode ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'
                    }`} />
                    <Moon className={`w-5 h-5 absolute transition-all duration-300 ${
                      darkMode ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-180 scale-0'
                    }`} />
                  </div>
                </button>

                <button className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  {badges.notifications > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 dark:bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </button>
                
                <button className="p-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                  <Activity className="w-5 h-5" />
                </button>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto bg-gray-100 dark:bg-gray-900">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Store, ShoppingCart, Phone, Mail, MapPin, Clock, Star,
  ChevronDown, Search, Filter, ShoppingBag, Users, Shield,
  CheckCircle, Zap, Gift, TrendingUp, MessageCircle, Share2,
  Facebook, Instagram, Twitter, Copy, ExternalLink, Loader2,
  X, Plus, Minus, AlertCircle, Check, ArrowRight, Sparkles,
  Moon, Sun, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'next/navigation';

export default function PublicAgentStore() {
  const params = useParams();
  const subdomain = params.subdomain;

  // Dark Mode State
  const [darkMode, setDarkMode] = useState(false);
  
  // State Management
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showClosedModal, setShowClosedModal] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Customer Form
  const [customerForm, setCustomerForm] = useState({
    phoneNumber: '',
    email: '',
    name: ''
  });

  // Networks Configuration
  const networks = [
    { id: 'MTN', name: 'MTN', color: '#FFCB05', icon: '📱' },
    { id: 'TELECEL', name: 'Telecel', color: '#E30613', icon: '📞' },
    { id: 'AT', name: 'AirtelTigo', color: '#0066CC', icon: '📲' },
    { id: 'YELLO', name: 'Yello', color: '#FF6B35', icon: '☎️' }
  ];

  useEffect(() => {
    // Load dark mode preference from localStorage
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Fetch store data
    fetchStoreData();
    loadCartFromStorage();
  }, [subdomain]);

  const fetchStoreData = async () => {
    setLoading(true);
    try {
      // Fetch store info
      const storeResponse = await fetch(`http://localhost:5000/api/store/public/${subdomain}`);
      const storeData = await storeResponse.json();

      if (!storeData.success) {
        setError('Store not found');
        setLoading(false);
        return;
      }

      setStore(storeData.data);

      // Check if store is closed and show modal
      if (!storeData.data.operatingStatus?.isOpen) {
        setShowClosedModal(true);
      }

      // Fetch products
      const productsResponse = await fetch(`http://localhost:5000/api/store/public/${subdomain}/products`);
      const productsData = await productsResponse.json();

      if (productsData.success) {
        setProducts(productsData.data.products);
        setGroupedProducts(productsData.data.grouped);
        
        // Set default network
        const availableNetworks = Object.keys(productsData.data.grouped);
        if (availableNetworks.length > 0) {
          setSelectedNetwork(availableNetworks[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching store:', error);
      setError('Failed to load store');
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const loadCartFromStorage = () => {
    const savedCart = localStorage.getItem(`cart_${subdomain}`);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  };

  const saveCartToStorage = (cartItems) => {
    localStorage.setItem(`cart_${subdomain}`, JSON.stringify(cartItems));
  };

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    let newCart;
    if (existingItem) {
      newCart = cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      newCart = [...cart, { ...product, quantity: 1 }];
    }
    
    setCart(newCart);
    saveCartToStorage(newCart);
    setSuccess(`${product.network} ${product.capacity}GB added to cart`);
    setTimeout(() => setSuccess(''), 2000);
  };

  const updateCartQuantity = (productId, change) => {
    const newCart = cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + change;
        return newQuantity <= 0 ? null : { ...item, quantity: newQuantity };
      }
      return item;
    }).filter(Boolean);
    
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const removeFromCart = (productId) => {
    const newCart = cart.filter(item => item.id !== productId);
    setCart(newCart);
    saveCartToStorage(newCart);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
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

  const handlePurchase = async () => {
    const phoneRegex = /^(\+233|0)[2-9]\d{8}$/;
    if (!phoneRegex.test(customerForm.phoneNumber.replace(/\s/g, ''))) {
      setError('Please enter a valid Ghana phone number');
      return;
    }

    setPurchasing(true);
    setError('');

    setTimeout(() => {
      setSuccess('Order placed successfully! You will receive your data bundles shortly.');
      setCart([]);
      saveCartToStorage([]);
      setShowCheckout(false);
      setShowCart(false);
      setCustomerForm({ phoneNumber: '', email: '', name: '' });
      setPurchasing(false);
    }, 2000);
  };

  const shareStore = async () => {
    const shareUrl = `${window.location.origin}/store/${subdomain}`;
    const shareText = `Check out ${store?.storeName} for the best data bundle prices! 🔥`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: store?.storeName,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setSuccess('Store link copied to clipboard!');
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Loading store...</p>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Store Not Found</h2>
          <p className="text-gray-600 dark:text-gray-300">This store doesn't exist or is temporarily unavailable.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'}`}>
      {/* Dark Mode Toggle - Fixed Position */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
        aria-label="Toggle dark mode"
      >
        {darkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-700" />
        )}
      </button>

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center max-w-sm animate-fade-in">
          <Check className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center max-w-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {/* Store Header */}
      <div className="relative">
        {/* Banner */}
        <div className="h-48 md:h-64 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-800 dark:to-purple-800 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Sparkles className="w-12 h-12 mx-auto mb-2 animate-pulse" />
              <p className="text-lg font-medium">Best Data Bundle Prices</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Store Info */}
        <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 transition-colors duration-300">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white dark:bg-gray-700 rounded-xl shadow-md p-2">
                <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center">
                  <Store className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                </div>
              </div>

              {/* Store Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{store.storeName}</h1>
                  {store.operatingStatus?.isOpen ? (
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-sm font-medium rounded-full">
                      Open
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm font-medium rounded-full">
                      Closed
                    </span>
                  )}
                </div>
                
                {store.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{store.description}</p>
                )}

                {/* Trust Badges */}
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Shield className="w-4 h-4 mr-1 text-green-600 dark:text-green-400" />
                    Verified Store
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Zap className="w-4 h-4 mr-1 text-yellow-600 dark:text-yellow-400" />
                    Instant Delivery
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <Users className="w-4 h-4 mr-1 text-blue-600 dark:text-blue-400" />
                    {Math.floor(Math.random() * 500) + 100}+ Customers
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                  <button className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Join WhatsApp Group
                  </button>
                  
                  <button className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors">
                    <Phone className="w-4 h-4 mr-2" />
                    Contact Us
                  </button>

                  <button
                    onClick={shareStore}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                </div>
              </div>

              {/* Contact Info */}
              <div className="md:text-right space-y-2">
                <div className="flex items-center justify-center md:justify-end text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-2" />
                  {store.whatsappNumber}
                </div>
                {store.contactEmail && (
                  <div className="flex items-center justify-center md:justify-end text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="w-4 h-4 mr-2" />
                    {store.contactEmail}
                  </div>
                )}
                {store.location?.city && (
                  <div className="flex items-center justify-center md:justify-end text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4 mr-2" />
                    {store.location.city}, {store.location.region}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Network Tabs */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Network</h2>
          <div className="flex flex-wrap gap-3">
            {Object.keys(groupedProducts).map((network) => {
              const networkConfig = networks.find(n => n.id === network);
              return (
                <button
                  key={network}
                  onClick={() => setSelectedNetwork(network)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                    selectedNetwork === network
                      ? 'text-white shadow-lg'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow'
                  }`}
                  style={{
                    backgroundColor: selectedNetwork === network ? networkConfig?.color : undefined,
                  }}
                >
                  <span className="mr-2">{networkConfig?.icon}</span>
                  {networkConfig?.name || network}
                </button>
              );
            })}
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 transition-colors duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {networks.find(n => n.id === selectedNetwork)?.name} Data Packages
          </h3>
          
          {/* Products Table - Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Package</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Validity</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Price</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {groupedProducts[selectedNetwork]?.sort((a, b) => a.capacity - b.capacity).map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center">
                        <div 
                          className="w-2 h-8 rounded-full mr-3"
                          style={{ backgroundColor: networks.find(n => n.id === product.network)?.color }}
                        />
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{product.capacity}GB</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.network} Bundle</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">
                        30 Days
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-lg">GH₵ {product.price.toFixed(2)}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 line-through">GH₵ {(product.price * 1.2).toFixed(2)}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={!store.operatingStatus?.isOpen}
                        className={`px-4 py-2 rounded-lg font-medium transition-all transform hover:scale-105 text-sm ${
                          store.operatingStatus?.isOpen
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {store.operatingStatus?.isOpen ? (
                          <>
                            <ShoppingCart className="w-4 h-4 inline mr-1" />
                            Add to Cart
                          </>
                        ) : (
                          'Unavailable'
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {groupedProducts[selectedNetwork]?.sort((a, b) => a.capacity - b.capacity).map((product) => (
              <div key={product.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center">
                    <div 
                      className="w-2 h-8 rounded-full mr-3"
                      style={{ backgroundColor: networks.find(n => n.id === product.network)?.color }}
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{product.capacity}GB</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{product.network} • 30 Days</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">GH₵ {product.price.toFixed(2)}</p>
                    <p className="text-xs text-green-600 dark:text-green-400 line-through">GH₵ {(product.price * 1.2).toFixed(2)}</p>
                  </div>
                </div>
                <button
                  onClick={() => addToCart(product)}
                  disabled={!store.operatingStatus?.isOpen}
                  className={`w-full py-2 rounded-lg font-medium transition-colors text-sm ${
                    store.operatingStatus?.isOpen
                      ? 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {store.operatingStatus?.isOpen ? 'Add to Cart' : 'Store Closed'}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 mb-8 transition-colors duration-300">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">Why Choose {store.storeName}?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Instant Delivery</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Get your data bundles activated within seconds</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">100% Secure</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Safe and reliable payment processing</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Best Prices</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Competitive rates with exclusive discounts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Shopping Cart Button */}
      <div className="fixed bottom-4 right-4 z-40">
        {cart.length > 0 && !showCart && (
          <button
            onClick={() => setShowCart(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-full p-4 shadow-lg flex items-center"
          >
            <ShoppingCart className="w-6 h-6" />
            <span className="ml-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {cart.reduce((total, item) => total + item.quantity, 0)}
            </span>
          </button>
        )}
      </div>

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowCart(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-800 shadow-xl z-50 overflow-y-auto transition-colors duration-300">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingCart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Your cart is empty</p>
                <button
                  onClick={() => setShowCart(false)}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <>
                <div className="p-4 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {item.network} {item.capacity}GB
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">₵{item.price} each</p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateCartQuantity(item.id, -1)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            <Minus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <span className="px-3 py-1 bg-white dark:bg-gray-800 rounded font-medium text-gray-900 dark:text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartQuantity(item.id, 1)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                          >
                            <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ₵{(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                  <div className="flex justify-between mb-4">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Total:</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ₵{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setShowCart(false);
                      setShowCheckout(true);
                    }}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4 inline ml-2" />
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {/* Checkout Modal */}
      {showCheckout && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Complete Your Order</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={customerForm.phoneNumber}
                  onChange={(e) => setCustomerForm({
                    ...customerForm,
                    phoneNumber: formatPhone(e.target.value)
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="024 123 4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={customerForm.name}
                  onChange={(e) => setCustomerForm({
                    ...customerForm,
                    name: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({
                    ...customerForm,
                    email: e.target.value
                  })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Order Summary</p>
                <div className="space-y-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-700 dark:text-gray-300">
                      <span>{item.network} {item.capacity}GB x {item.quantity}</span>
                      <span>₵{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 dark:border-gray-600 mt-2 pt-2 flex justify-between font-semibold text-gray-900 dark:text-white">
                  <span>Total:</span>
                  <span>₵{getTotalPrice().toFixed(2)}</span>
                </div>
              </div>

              {/* Join WhatsApp Group Reminder */}
              <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-3">
                <p className="text-sm text-green-800 dark:text-green-300">
                  <MessageCircle className="w-4 h-4 inline mr-1" />
                  Don't forget to join our WhatsApp group for exclusive deals!
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCheckout(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePurchase}
                  disabled={purchasing || !customerForm.phoneNumber}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {purchasing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Complete Order
                      <Check className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Closed Store Modal */}
      <AnimatePresence>
        {showClosedModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowClosedModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header with Icon */}
              <div className="text-center mb-4">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Store is Currently Closed
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  We're sorry, but {store?.storeName} is not accepting orders at the moment.
                </p>
              </div>

              {/* Store Hours Info */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Operating Hours
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Monday - Friday: 8:00 AM - 10:00 PM<br/>
                  Saturday - Sunday: 9:00 AM - 8:00 PM
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  *Orders are processed during operating hours only
                </p>
              </div>

              {/* Alternative Actions */}
              <div className="space-y-3 mb-4">
                <div className="flex items-start">
                  <MessageCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Join Our WhatsApp Group
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Get notified when we're back online and receive exclusive deals
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Contact Us Directly
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Call or WhatsApp: {store?.whatsappNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Send Us an Email
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      {store?.contactEmail || 'support@databundle.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <a
                  href={store?.whatsappGroupLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-4 py-2.5 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Join Group
                </a>
                
                <button
                  onClick={() => setShowClosedModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium rounded-lg transition-colors"
                >
                  Browse Products
                </button>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setShowClosedModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="bg-gray-100 dark:bg-gray-900 py-8 mt-12 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-2">© {new Date().getFullYear()} {store.storeName}. All rights reserved.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Powered by DataBundle Platform • {store.operatingStatus?.isOpen ? 'Open Now' : 'Currently Closed'}
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
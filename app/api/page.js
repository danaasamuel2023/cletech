'use client'
import React, { useState } from 'react';
import { 
  Book, Code, Key, Globe, Zap, AlertCircle, 
  ChevronDown, ChevronRight, Copy, Check,
  Terminal, FileJson, Clock, Shield, Database
} from 'lucide-react';

const ApiDocumentation = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedEndpoint, setExpandedEndpoint] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('curl');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const endpoints = [
    {
      id: 'get-products',
      method: 'GET',
      path: '/api/v1/purchase/products',
      description: 'Get available data products with pricing',
      params: {
        query: [
          { name: 'network', type: 'string', required: false, description: 'Filter by network (MTN, TELECEL, AT, etc.)' },
          { name: 'in_stock_only', type: 'boolean', required: false, description: 'Show only in-stock items (default: true)' }
        ]
      },
      response: {
        success: {
          success: true,
          data: {
            products: [
              {
                network: 'MTN',
                capacity: 2,
                price: 10.50,
                currency: 'GHS',
                description: '2GB MTN Data Bundle',
                in_stock: true
              }
            ],
            total: 15,
            user_role: 'agent'
          }
        }
      }
    },
    {
      id: 'single-purchase',
      method: 'POST',
      path: '/api/v1/purchase/single',
      description: 'Make a single data purchase',
      params: {
        body: [
          { name: 'phone_number', type: 'string', required: true, description: 'Ghana phone number (0XXXXXXXXX format)' },
          { name: 'network', type: 'string', required: true, description: 'Network provider (MTN, TELECEL, AT, etc.)' },
          { name: 'capacity', type: 'number', required: true, description: 'Data capacity in GB (0.1 - 100)' },
          { name: 'payment_method', type: 'string', required: true, description: 'Payment method (wallet or paystack)' },
          { name: 'callback_url', type: 'string', required: false, description: 'URL for payment callback (Paystack only)' },
          { name: 'reference', type: 'string', required: false, description: 'Custom reference (auto-generated if not provided)' }
        ]
      },
      response: {
        success: {
          success: true,
          message: 'Purchase successful',
          data: {
            reference: 'API-PURCHASE-1234567-ABC123',
            amount: 10.50,
            network: 'MTN',
            capacity: 2,
            phone_number: '0241234567',
            status: 'processing',
            new_balance: 489.50,
            timestamp: '2024-01-20T10:30:00Z'
          }
        },
        paystack: {
          success: true,
          message: 'Payment initialized',
          data: {
            reference: 'API-PURCHASE-1234567-ABC123',
            amount: 10.50,
            payment_url: 'https://checkout.paystack.com/abc123',
            access_code: 'abc123xyz'
          }
        }
      }
    },
    {
      id: 'bulk-purchase',
      method: 'POST',
      path: '/api/v1/purchase/bulk',
      description: 'Make multiple purchases in one request (max 100)',
      params: {
        body: [
          { name: 'purchases', type: 'array', required: true, description: 'Array of purchase objects' },
          { name: 'purchases[].phone_number', type: 'string', required: true, description: 'Phone number for each purchase' },
          { name: 'purchases[].capacity', type: 'number', required: true, description: 'Data capacity for each purchase' },
          { name: 'purchases[].network', type: 'string', required: false, description: 'Network for each purchase (optional)' },
          { name: 'network', type: 'string', required: false, description: 'Default network for all purchases' },
          { name: 'payment_method', type: 'string', required: true, description: 'Payment method (wallet only for bulk)' }
        ]
      },
      response: {
        success: {
          success: true,
          message: 'Bulk purchase successful',
          data: {
            batch_reference: 'API-BULK-1234567-ABC123',
            total_purchases: 3,
            total_cost: 35.50,
            new_balance: 464.50,
            purchases: [
              {
                phone_number: '0241234567',
                network: 'MTN',
                capacity: 2,
                price: 10.50
              }
            ],
            timestamp: '2024-01-20T10:30:00Z'
          }
        }
      }
    },
    {
      id: 'verify-payment',
      method: 'GET',
      path: '/api/v1/purchase/verify/:reference',
      description: 'Verify payment status',
      params: {
        path: [
          { name: 'reference', type: 'string', required: true, description: 'Payment reference' }
        ]
      },
      response: {
        success: {
          success: true,
          data: {
            reference: 'API-PURCHASE-1234567-ABC123',
            status: 'processing',
            total_amount: 10.50,
            purchases: [
              {
                network: 'MTN',
                capacity: 2,
                phone_number: '0241234567',
                price: 10.50,
                status: 'processing'
              }
            ],
            timestamp: '2024-01-20T10:30:00Z'
          }
        }
      }
    },
    {
      id: 'purchase-history',
      method: 'GET',
      path: '/api/v1/purchase/history',
      description: 'Get purchase history',
      params: {
        query: [
          { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
          { name: 'limit', type: 'integer', required: false, description: 'Items per page (default: 20, max: 100)' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status' },
          { name: 'network', type: 'string', required: false, description: 'Filter by network' },
          { name: 'from_date', type: 'date', required: false, description: 'Start date (YYYY-MM-DD)' },
          { name: 'to_date', type: 'date', required: false, description: 'End date (YYYY-MM-DD)' }
        ]
      }
    },
    {
      id: 'usage-stats',
      method: 'GET',
      path: '/api/v1/purchase/stats',
      description: 'Get API usage statistics',
      params: {
        query: [
          { name: 'period', type: 'string', required: false, description: 'Time period: 24h, 7d, 30d (default: 7d)' }
        ]
      }
    }
  ];

  const codeExamples = {
    curl: {
      getProducts: `curl -X GET "https://api.cletech.com/api/v1/purchase/products?network=MTN" \\
  -H "x-api-key: YOUR_API_KEY"`,
      
      singlePurchase: `curl -X POST "https://api.cletech.com/api/v1/purchase/single" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "phone_number": "0241234567",
    "network": "MTN",
    "capacity": 2,
    "payment_method": "wallet"
  }'`,
      
      bulkPurchase: `curl -X POST "https://api.cletech.com/api/v1/purchase/bulk" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "purchases": [
      {"phone_number": "0241234567", "capacity": 2},
      {"phone_number": "0551234567", "capacity": 5}
    ],
    "network": "MTN",
    "payment_method": "wallet"
  }'`
    },
    javascript: {
      getProducts: `const response = await fetch('https://api.cletech.com/api/v1/purchase/products?network=MTN', {
  headers: {
    'x-api-key': 'YOUR_API_KEY'
  }
});
const data = await response.json();`,
      
      singlePurchase: `const response = await fetch('https://api.cletech.com/api/v1/purchase/single', {
  method: 'POST',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    phone_number: '0241234567',
    network: 'MTN',
    capacity: 2,
    payment_method: 'wallet'
  })
});
const data = await response.json();`,
      
      bulkPurchase: `const response = await fetch('https://api.cletech.com/api/v1/purchase/bulk', {
  method: 'POST',
  headers: {
    'x-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    purchases: [
      { phone_number: '0241234567', capacity: 2 },
      { phone_number: '0551234567', capacity: 5 }
    ],
    network: 'MTN',
    payment_method: 'wallet'
  })
});
const data = await response.json();`
    },
    python: {
      getProducts: `import requests

response = requests.get(
    'https://api.cletech.com/api/v1/purchase/products',
    params={'network': 'MTN'},
    headers={'x-api-key': 'YOUR_API_KEY'}
)
data = response.json()`,
      
      singlePurchase: `import requests

response = requests.post(
    'https://api.cletech.com/api/v1/purchase/single',
    headers={'x-api-key': 'YOUR_API_KEY'},
    json={
        'phone_number': '0241234567',
        'network': 'MTN',
        'capacity': 2,
        'payment_method': 'wallet'
    }
)
data = response.json()`,
      
      bulkPurchase: `import requests

response = requests.post(
    'https://api.cletech.com/api/v1/purchase/bulk',
    headers={'x-api-key': 'YOUR_API_KEY'},
    json={
        'purchases': [
            {'phone_number': '0241234567', 'capacity': 2},
            {'phone_number': '0551234567', 'capacity': 5}
        ],
        'network': 'MTN',
        'payment_method': 'wallet'
    }
)
data = response.json()`
    },
    php: {
      getProducts: `<?php
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://api.cletech.com/api/v1/purchase/products?network=MTN",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        "x-api-key: YOUR_API_KEY"
    ],
]);
$response = curl_exec($curl);
$data = json_decode($response, true);`,
      
      singlePurchase: `<?php
$curl = curl_init();
$data = [
    'phone_number' => '0241234567',
    'network' => 'MTN',
    'capacity' => 2,
    'payment_method' => 'wallet'
];

curl_setopt_array($curl, [
    CURLOPT_URL => "https://api.cletech.com/api/v1/purchase/single",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_HTTPHEADER => [
        "x-api-key: YOUR_API_KEY",
        "Content-Type: application/json"
    ],
]);
$response = curl_exec($curl);
$result = json_decode($response, true);`
    }
  };

  const errorCodes = [
    { code: 400, message: 'Bad Request', description: 'Invalid request parameters or validation failed' },
    { code: 401, message: 'Unauthorized', description: 'Invalid or missing API key' },
    { code: 402, message: 'Payment Required', description: 'Insufficient wallet balance' },
    { code: 404, message: 'Not Found', description: 'Resource not found' },
    { code: 429, message: 'Too Many Requests', description: 'Rate limit exceeded' },
    { code: 500, message: 'Internal Server Error', description: 'Server error, please try again' }
  ];

  const navigation = [
    { id: 'overview', label: 'Overview', icon: Book },
    { id: 'authentication', label: 'Authentication', icon: Key },
    { id: 'endpoints', label: 'Endpoints', icon: Globe },
    { id: 'examples', label: 'Code Examples', icon: Code },
    { id: 'errors', label: 'Error Codes', icon: AlertCircle },
    { id: 'rate-limits', label: 'Rate Limits', icon: Clock },
    { id: 'webhooks', label: 'Webhooks', icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen sticky top-0">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">API Documentation</h2>
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                      activeSection === item.id
                        ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="max-w-4xl">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">CLETECH Data Purchase API</h1>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  The CLETECH API allows you to programmatically purchase data bundles for Ghana networks. 
                  Integrate our services into your applications with simple REST API calls.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Database className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Multiple Networks</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Support for MTN, Telecel, AirtelTigo, and more Ghana networks
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Secure Payments</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Wallet and Paystack payment options with secure processing
                    </p>
                  </div>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
                    <Zap className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Fast Processing</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Instant wallet payments and bulk purchase support
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Base URL</h3>
                  <code className="text-sm bg-white dark:bg-gray-800 px-3 py-1 rounded">
                    https://api.cletech.com/api/v1
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Authentication Section */}
          {activeSection === 'authentication' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Authentication</h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  All API requests require authentication using an API key. Include your API key in the request header:
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <code className="text-sm text-gray-800 dark:text-gray-200">
                    x-api-key: YOUR_API_KEY
                  </code>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">Security Best Practices</h4>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-400 space-y-1 list-disc list-inside">
                      <li>Never expose your API key in client-side code</li>
                      <li>Use environment variables to store API keys</li>
                      <li>Rotate your API keys regularly</li>
                      <li>Use HTTPS for all API requests</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Getting an API Key</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
                  <li>Log in to your CLETECH account</li>
                  <li>Navigate to Settings → API Keys</li>
                  <li>Click "Generate New Key"</li>
                  <li>Copy your API key and store it securely</li>
                </ol>
              </div>
            </div>
          )}

          {/* Endpoints Section */}
          {activeSection === 'endpoints' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">API Endpoints</h2>
              
              <div className="space-y-4">
                {endpoints.map((endpoint) => (
                  <div key={endpoint.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <button
                      onClick={() => setExpandedEndpoint(expandedEndpoint === endpoint.id ? null : endpoint.id)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          endpoint.method === 'GET' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {endpoint.method}
                        </span>
                        <div className="text-left">
                          <p className="font-mono text-sm text-gray-900 dark:text-white">{endpoint.path}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{endpoint.description}</p>
                        </div>
                      </div>
                      {expandedEndpoint === endpoint.id ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {expandedEndpoint === endpoint.id && (
                      <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 space-y-6">
                        {/* Parameters */}
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Parameters</h4>
                          {endpoint.params.query && (
                            <div className="mb-4">
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Query Parameters</h5>
                              <div className="space-y-2">
                                {endpoint.params.query.map((param) => (
                                  <div key={param.name} className="flex items-start space-x-2 text-sm">
                                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                      {param.name}
                                    </code>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {param.required && <span className="text-red-500">*</span>}
                                      {param.type} - {param.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {endpoint.params.body && (
                            <div>
                              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Request Body</h5>
                              <div className="space-y-2">
                                {endpoint.params.body.map((param) => (
                                  <div key={param.name} className="flex items-start space-x-2 text-sm">
                                    <code className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                                      {param.name}
                                    </code>
                                    <span className="text-gray-600 dark:text-gray-400">
                                      {param.required && <span className="text-red-500">*</span>}
                                      {param.type} - {param.description}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Response */}
                        {endpoint.response && (
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Response</h4>
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                              <pre className="text-xs overflow-auto">
                                <code className="text-gray-800 dark:text-gray-200">
                                  {JSON.stringify(endpoint.response.success || endpoint.response, null, 2)}
                                </code>
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Examples Section */}
          {activeSection === 'examples' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Code Examples</h2>
              
              <div className="mb-6">
                <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                  {Object.keys(codeExamples).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`px-4 py-2 font-medium text-sm capitalize transition-colors ${
                        selectedLanguage === lang
                          ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {/* Get Products Example */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Get Products</h3>
                  </div>
                  <div className="p-6">
                    <div className="relative">
                      <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
                        <code className="text-sm text-gray-800 dark:text-gray-200">
                          {codeExamples[selectedLanguage].getProducts}
                        </code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(codeExamples[selectedLanguage].getProducts, 'getProducts')}
                        className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {copiedCode === 'getProducts' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Single Purchase Example */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Single Purchase</h3>
                  </div>
                  <div className="p-6">
                    <div className="relative">
                      <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
                        <code className="text-sm text-gray-800 dark:text-gray-200">
                          {codeExamples[selectedLanguage].singlePurchase}
                        </code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(codeExamples[selectedLanguage].singlePurchase, 'singlePurchase')}
                        className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {copiedCode === 'singlePurchase' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bulk Purchase Example */}
                {selectedLanguage !== 'php' && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white">Bulk Purchase</h3>
                    </div>
                    <div className="p-6">
                      <div className="relative">
                        <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 overflow-auto">
                          <code className="text-sm text-gray-800 dark:text-gray-200">
                            {codeExamples[selectedLanguage].bulkPurchase}
                          </code>
                        </pre>
                        <button
                          onClick={() => copyToClipboard(codeExamples[selectedLanguage].bulkPurchase, 'bulkPurchase')}
                          className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {copiedCode === 'bulkPurchase' ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Codes Section */}
          {activeSection === 'errors' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Error Codes</h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">Code</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">Message</th>
                      <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900 dark:text-white">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorCodes.map((error) => (
                      <tr key={error.code} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="px-6 py-4">
                          <span className="font-mono text-sm text-gray-900 dark:text-white">{error.code}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{error.message}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{error.description}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Error Response Format</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm overflow-auto">
                    <code className="text-gray-800 dark:text-gray-200">
{`{
  "success": false,
  "message": "Insufficient wallet balance",
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "required_amount": 25.50,
    "current_balance": 10.00
  }
}`}
                    </code>
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* Rate Limits Section */}
          {activeSection === 'rate-limits' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Rate Limits</h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  API rate limits help ensure fair usage and maintain service quality for all users.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Default Rate Limit</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Standard API key limit</p>
                    </div>
                    <span className="font-mono text-purple-600 dark:text-purple-400">30 requests/minute</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Premium Rate Limit</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Enhanced limit for premium accounts</p>
                    </div>
                    <span className="font-mono text-purple-600 dark:text-purple-400">100 requests/minute</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Burst Allowance</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Short-term spike allowance</p>
                    </div>
                    <span className="font-mono text-purple-600 dark:text-purple-400">50 requests</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-3">Rate Limit Headers</h3>
                <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
                  The API returns rate limit information in response headers:
                </p>
                <div className="space-y-2 text-sm">
                  <div>
                    <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">X-RateLimit-Limit</code>
                    <span className="text-blue-700 dark:text-blue-300 ml-2">- Requests allowed per window</span>
                  </div>
                  <div>
                    <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">X-RateLimit-Remaining</code>
                    <span className="text-blue-700 dark:text-blue-300 ml-2">- Remaining requests in current window</span>
                  </div>
                  <div>
                    <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">X-RateLimit-Reset</code>
                    <span className="text-blue-700 dark:text-blue-300 ml-2">- Time when the rate limit resets (Unix timestamp)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Webhooks Section */}
          {activeSection === 'webhooks' && (
            <div className="max-w-4xl">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Webhooks</h2>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Webhooks allow you to receive real-time notifications about events in your account.
                </p>
                
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Available Events</h3>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start space-x-2">
                    <span className="text-green-600 dark:text-green-400">•</span>
                    <span><strong>purchase.completed</strong> - Purchase successfully processed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-red-600 dark:text-red-400">•</span>
                    <span><strong>purchase.failed</strong> - Purchase failed to process</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span><strong>payment.received</strong> - Payment confirmed</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Webhook Payload</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm overflow-auto">
                    <code className="text-gray-800 dark:text-gray-200">
{`{
  "event": "purchase.completed",
  "timestamp": "2024-01-20T10:30:00Z",
  "data": {
    "reference": "API-PURCHASE-1234567-ABC123",
    "network": "MTN",
    "capacity": 2,
    "phone_number": "0241234567",
    "amount": 10.50,
    "status": "completed"
  }
}`}
                    </code>
                  </pre>
                </div>

                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Webhook Security</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All webhook requests include a signature in the <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">X-Webhook-Signature</code> header 
                    for verification. Validate this signature using your webhook secret.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiDocumentation;
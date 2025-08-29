// components/Footer.jsx - Cletech Professional Footer
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Mail, MapPin, Facebook, Twitter, Instagram, 
  Linkedin, Youtube, Send, ChevronRight, 
  MessageCircle, CheckCircle, GraduationCap
} from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    setSubscribed(true);
    setTimeout(() => setSubscribed(false), 3000);
    setEmail('');
  };

  const company = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
    { name: 'Partners', href: '/partners' },
  ];

  const services = [
    { name: 'Data Bundles', href: '/services' },
    { name: 'Result Checker', href: '/result-checker' },
    { name: 'Bulk Purchase', href: '/services/bulk' },
    { name: 'Corporate Solutions', href: '/services/corporate' },
    { name: 'API Documentation', href: '/api' },
  ];

  const support = [
    { name: 'Help Center', href: '/help' },
    { name: 'Contact Support', href: '/contact' },
    { name: 'FAQs', href: '/faqs' },
    { name: 'System Status', href: '/status' },
  ];

  const legal = [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Refund Policy', href: '/refund' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: <Facebook className="w-5 h-5" />, href: '#' },
    { name: 'Twitter', icon: <Twitter className="w-5 h-5" />, href: '#' },
    { name: 'Instagram', icon: <Instagram className="w-5 h-5" />, href: '#' },
    { name: 'LinkedIn', icon: <Linkedin className="w-5 h-5" />, href: '#' },
    { name: 'YouTube', icon: <Youtube className="w-5 h-5" />, href: '#' },
    { name: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, href: '#' },
  ];

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                CLETECH
              </h3>
              <p className="mt-2 text-gray-600">
                Ghana's leading data distribution platform.
              </p>
            </div>
            
            {/* Newsletter */}
            <div className="mb-6">
              <h4 className="text-gray-900 font-semibold mb-3">Subscribe to our newsletter</h4>
              <form onSubmit={handleSubscribe} className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 pr-12"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 top-1 bottom-1 px-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  {subscribed ? <CheckCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </button>
              </form>
              {subscribed && (
                <p className="mt-2 text-green-600 text-sm">Successfully subscribed!</p>
              )}
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 border border-gray-300 rounded-lg flex items-center justify-center text-gray-600 hover:text-purple-600 hover:border-purple-600 transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href} className="text-gray-600 hover:text-purple-600 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <Link href={service.href} className="text-gray-600 hover:text-purple-600 transition-colors flex items-center">
                    {service.name === 'Result Checker' && <GraduationCap className="w-4 h-4 mr-1" />}
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              {support.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className="text-gray-600 hover:text-purple-600 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              {legal.map((item, index) => (
                <li key={index}>
                  <Link href={item.href} className="text-gray-600 hover:text-purple-600 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center text-gray-600">
              <Mail className="w-5 h-5 mr-2 text-purple-600" />
              <a href="mailto:support@cletech.com" className="hover:text-purple-600 transition-colors">
                support@cletech.com
              </a>
            </div>
            <div className="flex items-center text-gray-600">
              <MessageCircle className="w-5 h-5 mr-2 text-purple-600" />
              <span>+233 24 123 4567</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2 text-purple-600" />
              <span>Accra, Ghana</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
            <div className="text-gray-600 text-sm">
              © 2025 Cletech. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-6 text-sm">
              <Link href="/terms" className="text-gray-600 hover:text-purple-600 transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-gray-600 hover:text-purple-600 transition-colors">
                Privacy
              </Link>
              <Link href="/cookies" className="text-gray-600 hover:text-purple-600 transition-colors">
                Cookies
              </Link>
              <Link href="/sitemap" className="text-gray-600 hover:text-purple-600 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
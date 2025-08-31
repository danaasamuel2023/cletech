// app/layout.js
'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/component/nav";
import Footer from "@/component/footer";
import { usePathname } from 'next/navigation';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  
  // Check if we're on a store page or verification page
  const isStorePage = pathname?.startsWith('/store/');
  const isVerifyPage = pathname?.startsWith('/verify/store/');
  
  // Hide navbar and footer on these pages
  const hideNavAndFooter = isStorePage || isVerifyPage;
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Only show Navbar if not on store or verify page */}
        {!hideNavAndFooter && <Navbar />}
        
        {children}
        
        {/* Only show Footer if not on store or verify page */}
        {!hideNavAndFooter && <Footer />}
      </body>
    </html>
  );
}
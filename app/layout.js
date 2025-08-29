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
  
  // Check if we're on a store page
  const isStorePage = pathname?.startsWith('/store/');
  
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Only show Navbar if not on store page */}
        {!isStorePage && <Navbar />}
        
        {children}
        
        {/* Only show Footer if not on store page */}
        {!isStorePage && <Footer />}
      </body>
    </html>
  );
}

// // Create a separate metadata.js file for metadata export
// // app/metadata.js
// export const metadata = {
//   title: "Cletecn Platform",
//   description: "Best data bundle prices in Ghana",
// };
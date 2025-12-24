"use client"

import { HEADER, SOCIAL_LINKS } from "@/data";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="w-full bg-white shadow-sm border-b pb-4 ">
      <div className="mx-auto container px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20 ">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <Image 
              src="/logo.png" 
              alt="Logo" 
              width={80} 
              height={80}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <ul className="flex items-center space-x-6 lg:space-x-8 ">
              {HEADER.map((item) => (
                <li key={item.path}>
                  <Link 
                    href={item.path}
                    className="text-gray-700 hover:underline hover:text-primary font-medium transition-colors duration-200 text-sm lg:text-base"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Search Bar */}
          <div className=" flex gap-4">
          <button className=" bg-primary p-2  rounded-lg">
            <Link href="/">
              Login
            </Link>
          </button>
          <button className=" bg-primary p-2  rounded-lg">
            <Link href="/subscribe">
              Subscribe
            </Link>
            </button>
          </div>

          {/* Desktop Social Links */}
          

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md text-primary hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            {SOCIAL_LINKS.map((item) => (
              <Link 
                key={item.platform} 
                href={item.url}
                className="hover:opacity-75 transition-opacity duration-200"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Image
                  src={item.icon}
                  alt={item.platform}
                  width={24}
                  height={24}
                  className="w-5 h-5 lg:w-6 lg:h-6"
                />
              </Link>
            ))}
          </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="mb-4">
              <ul className="space-y-3">
                {HEADER.map((item) => (
                  <li key={item.path}>
                    <Link 
                      href={item.path}
                      className="block text-gray-700 hover:text-primary font-medium transition-colors duration-200 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            
            {/* Mobile Social Links */}
            <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
              {SOCIAL_LINKS.map((item) => (
                <Link 
                  key={item.platform} 
                  href={item.url}
                  className="hover:opacity-75 transition-opacity duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Image
                    src={item.icon}
                    alt={item.platform}
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
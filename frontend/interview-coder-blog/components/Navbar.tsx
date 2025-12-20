import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/95 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="text-brand-yellow">
            {/* Wing Icon Simulation */}
             <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-brand-yellow transform -rotate-12">
              <path d="M2 12C2 12 5 2 13 2C21 2 22 12 22 12C22 12 19 22 11 22C3 22 2 12 2 12Z" fillOpacity="0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12C2 12 6 5 13 5C17 5 20 10 22 12" />
              <path d="M2 12C2 12 6 19 13 19C17 19 20 14 22 12" />
              <path d="M8 12H16" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            Interview Coder
          </span>
        </div>

        {/* Desktop Links - Centered */}
        <div className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2">
          {['Proof', 'Pricing', 'Help', 'Blog', 'How it works'].map((item) => (
            <a
              key={item}
              href="#"
              className={`text-[15px] font-medium transition-colors duration-200 ${
                item === 'Blog' ? 'text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              {item}
            </a>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-6">
          <button className="text-[15px] font-medium text-gray-400 hover:text-white transition-colors">
            Login
          </button>
          <button className="bg-white text-black px-6 py-2.5 rounded-full text-[15px] font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2">
            Download for Free
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-gray-300"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-dark-bg border-b border-dark-border p-6 space-y-4 shadow-xl">
          {['Proof', 'Pricing', 'Help', 'Blog', 'How it works'].map((item) => (
            <a
              key={item}
              href="#"
              className="block text-gray-300 font-medium hover:text-white py-2"
            >
              {item}
            </a>
          ))}
          <div className="h-px bg-dark-border my-4" />
          <div className="flex flex-col gap-3">
            <button className="w-full text-center text-gray-300 font-medium py-3 border border-dark-border rounded-lg">
              Login
            </button>
            <button className="w-full text-center bg-white text-black font-bold py-3 rounded-lg">
              Download for Free
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};
import React from 'react';
import { MessageCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <>
      <footer className="bg-dark-bg border-t border-dark-border py-12">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
             <div className="text-brand-yellow">
               {/* Tiny Logo */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 12C2 12 5 2 13 2C21 2 22 12 22 12C22 12 19 22 11 22C3 22 2 12 2 12Z" fillOpacity="0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12H22" strokeWidth="2"/>
                </svg>
             </div>
             <span className="font-bold text-white">Interview Coder</span>
          </div>

          <div className="flex gap-8 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Proof</a>
            <a href="#" className="hover:text-white transition-colors">Pricing</a>
            <a href="#" className="hover:text-white transition-colors">Help</a>
            <a href="#" className="hover:text-white transition-colors">Blog</a>
            <a href="#" className="hover:text-white transition-colors">How it works</a>
          </div>

          <div className="text-sm text-gray-600">
             © 2025 Interview Coder. All rights reserved.
          </div>
        </div>
      </footer>
      
      {/* Floating Chat Button */}
      <button className="fixed bottom-6 right-6 w-14 h-14 bg-brand-yellow rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50">
        <MessageCircle className="w-7 h-7 text-black fill-black" />
      </button>
    </>
  );
};
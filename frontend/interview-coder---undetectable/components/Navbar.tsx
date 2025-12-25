import React from 'react';
import { Terminal, Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../constants';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-yellow-400">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold tracking-tight text-white font-sans">
              Co-Interview
            </span>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-xs font-medium text-gray-400 hover:text-white transition-colors">
              Login
            </a>
            <button className="px-4 py-1.5 text-xs font-semibold text-black bg-white hover:bg-gray-200 rounded-full transition-all duration-200">
              Download for Free →
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-400 hover:text-white rounded-md"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-b border-white/10">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
              <a href="#" className="text-sm font-medium text-gray-300">Login</a>
              <button className="w-full py-2 text-sm font-semibold text-black bg-white rounded-full">
                Download for Free →
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

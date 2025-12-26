import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from './ui/Button';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-black/90 backdrop-blur-md border-white/10' : 'bg-black border-transparent'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-3 cursor-pointer">
                        <img src="https://www.interviewcoder.co/logo.svg" alt="Co-Interview" className="w-8 h-8 rounded-xl" />
                        <span className="text-lg font-bold tracking-tight text-white hidden md:block">Co-Interview</span>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        <a href="/#proof" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'Proof' }))} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Proof</a>
                        <a href="/#pricing" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'Pricing' }))} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Pricing</a>
                        <a href="/#help" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'Help' }))} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Help</a>
                        <a href="/#blog" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'Blog' }))} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">Blog</a>
                        <Link to="/still_working" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'How it works' }))} className="text-sm font-medium text-gray-400 hover:text-white transition-colors">How it works</Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Button variant="ghost" size="sm">Login</Button>
                        {/* === PRE-REGISTRATION (CHANGE TO "Download for Free" WHEN PRODUCT LAUNCHES) === */}
                        <a href="#download" className="px-4 py-2 text-sm font-semibold text-black bg-white hover:bg-gray-100 rounded-full transition-all shadow-none">
                            Join Waitlist
                        </a>
                        {/* === END PRE-REGISTRATION === */}
                    </div>

                    {/* Mobile Toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-300 hover:text-white p-2"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-[#111] border-b border-white/10">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <a href="/#proof" onClick={() => import('../lib/analytics').then(m => m.trackEvent('mobile_nav_click', { label: 'Proof' }))} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Proof</a>
                        <a href="/#pricing" onClick={() => import('../lib/analytics').then(m => m.trackEvent('mobile_nav_click', { label: 'Pricing' }))} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">Pricing</a>
                        <Link to="/still_working" onClick={() => import('../lib/analytics').then(m => m.trackEvent('mobile_nav_click', { label: 'How it Works' }))} className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-white/5">How it Works</Link>
                        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col space-y-3 px-3">
                            <Button variant="ghost" className="w-full justify-start">Login</Button>
                            {/* === PRE-REGISTRATION (CHANGE TO "Download for Free" WHEN PRODUCT LAUNCHES) === */}
                            <a href="#download" className="w-full py-2 text-center text-sm font-semibold text-black bg-white rounded-full">
                                Join Waitlist
                            </a>
                            {/* === END PRE-REGISTRATION === */}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

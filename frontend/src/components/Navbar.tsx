import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';

const Navbar: React.FC = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            setDropdownOpen(false);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
    const userInitial = userName.charAt(0).toUpperCase();

    return (
        <nav className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-black/90 backdrop-blur-md border-white/10' : 'bg-black border-transparent'}`}>
            <div className="w-full px-6 sm:px-10 lg:px-16">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center space-x-3 cursor-pointer">
                        <img src="https://www.interviewcoder.co/logo.svg" alt="Co-Interview" className="w-10 h-10 rounded-xl" />
                        <span className="text-xl font-bold tracking-tight text-white hidden md:block">Interview Coder</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-10">
                        <a href="/#proof" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'Proof' }))} className="text-base font-medium text-gray-400 hover:text-white transition-colors">Proof</a>
                        <a href="/#pricing" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'Pricing' }))} className="text-base font-medium text-gray-400 hover:text-white transition-colors">Pricing</a>
                        <a href="/#help" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'Help' }))} className="text-base font-medium text-gray-400 hover:text-white transition-colors">Help</a>
                        <Link to="/blog" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'Blog' }))} className="text-base font-medium text-gray-400 hover:text-white transition-colors">Blog</Link>
                        <Link to="/still_working" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'How it works' }))} className="text-base font-medium text-gray-400 hover:text-white transition-colors">How it works</Link>
                    </div>

                    {/* Desktop Right Side - Conditional based on auth state */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            /* Logged In - Show User Avatar with Dropdown */
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(!dropdownOpen)}
                                    className="flex items-center gap-2"
                                >
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full bg-[#E91E63] flex items-center justify-center text-white font-bold text-sm">
                                            {userInitial}
                                        </div>
                                        {/* FREE badge */}
                                        <span className="absolute -top-1 -right-1 bg-green-500 text-[8px] text-white font-bold px-1 rounded">
                                            FREE
                                        </span>
                                    </div>
                                </button>

                                {/* Dropdown Menu */}
                                {dropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-40 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                                        >
                                            Dashboard
                                        </Link>
                                        <Link
                                            to="/still_working"
                                            onClick={() => setDropdownOpen(false)}
                                            className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 transition-colors"
                                        >
                                            Help
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-[#FACC15] hover:bg-white/5 transition-colors"
                                        >
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Not Logged In - Show Login & Join Waitlist */
                            <>
                                <Link to="/signin" onClick={() => import('../lib/analytics').then(m => m.trackEvent('nav_click', { label: 'Login' }))} className="px-5 py-2 text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-all">Login</Link>
                                {/* === PRE-REGISTRATION (CHANGE TO "Download for Free" WHEN PRODUCT LAUNCHES) === */}
                                <a href="#download" className="px-5 py-2.5 text-sm font-semibold text-black bg-white hover:bg-gray-100 rounded-full transition-all shadow-none">
                                    Join Waitlist
                                </a>
                                {/* === END PRE-REGISTRATION === */}
                            </>
                        )}
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
                            {user ? (
                                /* Mobile - Logged In */
                                <>
                                    <div className="flex items-center gap-3 py-2">
                                        <div className="w-10 h-10 rounded-full bg-[#E91E63] flex items-center justify-center text-white font-bold text-sm">
                                            {userInitial}
                                        </div>
                                        <span className="text-white font-medium">{userName}</span>
                                    </div>
                                    <Link to="/dashboard" className="w-full text-left py-2 px-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all">Dashboard</Link>
                                    <Link to="/still_working" className="w-full text-left py-2 px-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all">Help</Link>
                                    <button onClick={handleLogout} className="w-full text-left py-2 px-3 text-[#FACC15] hover:bg-white/5 rounded-md transition-all">Log out</button>
                                </>
                            ) : (
                                /* Mobile - Not Logged In */
                                <>
                                    <Link to="/signin" onClick={() => import('../lib/analytics').then(m => m.trackEvent('mobile_nav_click', { label: 'Login' }))} className="w-full text-left py-2 px-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-all">Login</Link>
                                    {/* === PRE-REGISTRATION (CHANGE TO "Download for Free" WHEN PRODUCT LAUNCHES) === */}
                                    <a href="#download" className="w-full py-2 text-center text-sm font-semibold text-black bg-white rounded-full">
                                        Join Waitlist
                                    </a>
                                    {/* === END PRE-REGISTRATION === */}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

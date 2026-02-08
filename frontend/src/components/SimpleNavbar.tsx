import React from 'react';
import { Link } from 'react-router-dom';

const SimpleNavbar: React.FC = () => {
    return (
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2">
                        <img src="/navbar-logo.png" alt="Co-Interview" className="w-8 h-8" />
                        <span className="text-xl font-semibold text-gray-900">Co-Interview</span>
                    </Link>

                    {/* Navigation Links */}
                    <nav className="flex items-center space-x-6">
                        <Link
                            to="/help"
                            onClick={() => {
                                import('../lib/analytics').then(({ trackEvent }) => {
                                    trackEvent('nav_click', { item: 'help', destination: '/help' });
                                });
                            }}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            Help
                        </Link>
                        <a
                            href="https://github.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                                import('../lib/analytics').then(({ trackEvent }) => {
                                    trackEvent('nav_click', { item: 'github', destination: 'https://github.com' });
                                });
                            }}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            GitHub
                        </a>
                        <Link
                            to="/download"
                            onClick={() => {
                                import('../lib/analytics').then(({ trackEvent }) => {
                                    trackEvent('nav_click', { item: 'download', destination: '/download' });
                                });
                            }}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            Download
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default SimpleNavbar;

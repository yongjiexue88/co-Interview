import React from 'react';
import { Link } from 'react-router-dom';

const guides = [
    {
        title: 'API Key Setup',
        description: 'Get and configure your Google Gemini API key',
        href: '#api-key',
    },
    {
        title: 'macOS Audio Permissions',
        description: 'Enable audio recording permissions on macOS',
        href: '#audio-permissions',
    },
    {
        title: 'macOS Installation Warning',
        description: 'Resolve security warnings when installing on macOS',
        href: '#installation-warning',
    },
    {
        title: 'Clear Storage',
        description: 'Reset your app data and settings',
        href: '#clear-storage',
    },
];

const socialLinks = [
    { name: 'Discord', href: 'https://discord.com', icon: '💬' },
    { name: 'Instagram', href: 'https://instagram.com', icon: '📷' },
    { name: 'Twitter', href: 'https://twitter.com', icon: '🐦' },
    { name: 'TikTok', href: 'https://tiktok.com', icon: '🎵' },
];

const HelpPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="text-lg font-semibold text-gray-900 hover:underline">
                            Co-Interview
                        </Link>
                        <nav className="flex items-center space-x-6">
                            <Link to="/help" className="text-sm font-medium text-gray-900">
                                Help
                            </Link>
                            <a href="#download" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                Download
                            </a>
                            <a
                                href="https://github.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                GitHub
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero Section */}
                <div className="mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
                    <p className="text-lg text-gray-600">Guides and solutions to common issues.</p>
                </div>

                {/* Divider */}
                <hr className="border-gray-200 mb-16" />

                {/* Guides Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Guides</h2>
                    <div className="space-y-8">
                        {guides.map((guide, index) => (
                            <a key={index} href={guide.href} className="block group">
                                <h3 className="text-base font-medium text-gray-900 underline group-hover:text-gray-600 mb-1">{guide.title}</h3>
                                <p className="text-sm text-gray-500">{guide.description}</p>
                            </a>
                        ))}
                    </div>
                </section>

                {/* Divider */}
                <hr className="border-gray-200 mb-16" />

                {/* Need More Help Section */}
                <section className="mb-16">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Need more help?</h2>
                    <p className="text-gray-600 mb-6">Can't find what you're looking for? Join our community for support.</p>
                    <div className="flex flex-wrap gap-4">
                        <a
                            href="https://discord.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Join Discord
                        </a>
                        <a
                            href="https://github.com/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            Report Issue
                        </a>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Social Links */}
                    <nav className="flex flex-wrap items-center justify-center gap-6 mb-6">
                        <a
                            href="https://github.com/yongjiexue88/co-Interview"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://discord.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Discord
                        </a>
                        <a
                            href="https://x.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            X
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Instagram
                        </a>
                        <a
                            href="https://tiktok.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            TikTok
                        </a>
                    </nav>

                    {/* Made by */}
                    <p className="text-sm text-gray-400">
                        Made by <span className="text-gray-600 underline">YX</span>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HelpPage;

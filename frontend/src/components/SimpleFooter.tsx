import React from 'react';

const socialLinks = [
    { name: 'GitHub', href: 'https://github.com' },
    { name: 'Discord', href: 'https://discord.com' },
    { name: 'X', href: 'https://x.com' },
    { name: 'Instagram', href: 'https://instagram.com' },
    { name: 'TikTok', href: 'https://tiktok.com' },
];

const SimpleFooter: React.FC = () => {
    return (
        <footer className="bg-white py-12 border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Social Links */}
                <nav className="flex flex-wrap items-center justify-center gap-6 mb-6">
                    {socialLinks.map(link => (
                        <a
                            key={link.name}
                            href={link.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {link.name}
                        </a>
                    ))}
                </nav>

                {/* Made by */}
                <p className="text-sm text-gray-400">
                    Made by <span className="text-gray-600 underline">YX</span>
                </p>
            </div>
        </footer>
    );
};

export default SimpleFooter;

import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Youtube, Instagram, Twitter } from 'lucide-react';
import Article from '../components/Article';

// Navbar Component (matching demo style)
const StillWorkingNavbar: React.FC = () => {
    const [isOpen, setIsOpen] = React.useState(false);

    const NAV_LINKS = [
        { name: 'Proof', href: '/#proof' },
        { name: 'Pricing', href: '/#pricing' },
        { name: 'Help', href: '/#help' },
        { name: 'Blog', href: '/#blog' },
        { name: 'How it works', href: '/still_working' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/90 backdrop-blur-md border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
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
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-8">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="text-xs font-medium text-gray-400 hover:text-white transition-colors"
                            >
                                {link.name}
                            </Link>
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
                            <Link
                                key={link.name}
                                to={link.href}
                                className="block py-2 text-sm font-medium text-gray-300 hover:text-white"
                            >
                                {link.name}
                            </Link>
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

// Footer Component (matching demo style)
const FOOTER_LINKS = {
    legal: ['Refund Policy', 'Terms of Service', 'Cancellation Policy'],
    pages: ['Contact Support', 'Create account', 'Login to account', 'Affiliate Program'],
    compare: ['Final Round AI Alternative', 'AiApply Alternative', 'Ultracode Alternative']
};

const SocialIcon = ({ Icon, href }: { Icon: any, href: string }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-neutral-500 hover:text-neutral-300 transition-colors">
        <Icon className="w-5 h-5" />
    </a>
);

const StillWorkingFooter: React.FC = () => {
    return (
        <footer className="mt-2 lg:mt-40 border-t border-white/[0.1] pt-20 bg-neutral-950/88 backdrop-blur-3xl w-full relative overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-8 md:px-8 text-sm text-neutral-500">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-12">

                    {/* Brand Column */}
                    <div className="space-y-4 max-w-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="text-yellow-400">
                                    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <span className="font-bold text-white text-xl">
                                    Co-Interview
                                </span>
                            </Link>
                        </div>
                        <p className="text-sm text-neutral-300/90 leading-relaxed">
                            Co-Interview is a desktop app designed to help job seekers ace technical interviews by providing real-time assistance with coding questions.
                        </p>
                        <div className="flex gap-4 pt-4 mb-10">
                            <SocialIcon Icon={Twitter} href="https://x.com/InterviewCoder" />
                            <SocialIcon Icon={Instagram} href="https://www.instagram.com/interviewcoder/" />
                            <SocialIcon Icon={Youtube} href="https://www.youtube.com/@InterviewCoder-official" />
                        </div>

                        <div className="mt-7 bg-neutral-900 border border-neutral-800 rounded-full px-3 py-1 flex items-center gap-2 w-fit select-none">
                            <div className="relative">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-neutral-400 text-xs">All systems online</span>
                        </div>
                        <div className="mt-3 text-[13px] select-none text-neutral-500">
                            © 2025 Co-Interview. All rights reserved.
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 w-full lg:w-auto">
                        <nav aria-label="Legal information">
                            <h2 className="text-neutral-300 font-bold select-none text-lg mb-4">Legal</h2>
                            <ul className="space-y-4 text-[15px] text-neutral-300">
                                {FOOTER_LINKS.legal.map((item) => (
                                    <li key={item}><a href="#" className="transition-colors hover:text-yellow-400">{item}</a></li>
                                ))}
                            </ul>
                        </nav>

                        <nav aria-label="Site navigation">
                            <h2 className="text-neutral-300 font-bold select-none text-lg mb-4">Pages</h2>
                            <ul className="space-y-4 text-[15px] text-neutral-300">
                                {FOOTER_LINKS.pages.map((item) => (
                                    <li key={item}><a href="#" className="transition-colors hover:text-yellow-400">{item}</a></li>
                                ))}
                            </ul>
                        </nav>

                        <nav aria-label="Platform comparisons">
                            <h2 className="text-neutral-300 font-bold select-none text-lg mb-4">Compare</h2>
                            <ul className="space-y-4 text-[15px] text-neutral-300">
                                {FOOTER_LINKS.compare.map((item) => (
                                    <li key={item}><a href="#" className="transition-colors hover:text-yellow-400">{item}</a></li>
                                ))}
                            </ul>
                        </nav>
                    </div>

                </div>

                <h1 className="text-center mt-20 text-[min(10vw,10rem)] font-semibold bg-clip-text text-transparent bg-gradient-to-b from-white/[0.01] to-white/[0.078] lg:-mb-5 select-none whitespace-nowrap tracking-[-0.04em] leading-[90.2%]">
                    Co-Interview
                </h1>
            </div>
        </footer>
    );
};

// Main Page Component
const StillWorkingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#161616] text-gray-300 font-sans selection:bg-yellow-500/30 overflow-x-hidden">
            <StillWorkingNavbar />
            <main className="relative z-10">
                <Article />
            </main>
            <StillWorkingFooter />

            {/* Floating Chat Bubble */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="w-12 h-12 bg-[#FACC15] rounded-full flex items-center justify-center text-black shadow-lg hover:scale-105 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default StillWorkingPage;

import React from 'react';
import { Link } from 'react-router-dom';
import { Twitter, Instagram, Youtube } from 'lucide-react';
import { footerLinks } from '../content/siteContent';

const SocialIcon = ({ Icon, href, platform }: { Icon: any; href: string; platform: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => import('../lib/analytics').then(m => m.trackEvent('footer_social_click', { platform }))}
        className="text-neutral-500 hover:text-neutral-300 transition-colors"
    >
        <Icon className="w-5 h-5" />
    </a>
);

const Footer: React.FC = () => {
    return (
        <footer className="mt-2 lg:mt-20 border-t border-white/[0.1] pt-20 bg-neutral-950/88 backdrop-blur-3xl w-full relative overflow-hidden font-sans">
            <div className="max-w-7xl mx-auto px-8 md:px-8 text-sm text-neutral-500">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-12">
                    {/* Brand Column */}
                    <div className="space-y-4 max-w-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <Link to="/" className="flex items-center gap-2">
                                <div className="text-yellow-400">
                                    <img src="/favicon.png" alt="Co-Interview" className="w-8 h-8 rounded-lg" />
                                </div>
                                <span className="font-bold text-white text-xl">Co-Interview</span>
                            </Link>
                        </div>
                        <p className="text-sm text-neutral-300/90 leading-relaxed">
                            Co-Interview is a desktop app designed to help job seekers ace technical interviews by providing real-time assistance with
                            coding questions.
                        </p>
                        <div className="flex gap-4 pt-4 mb-6">
                            <SocialIcon Icon={Twitter} href="https://x.com/InterviewCoder" platform="twitter" />
                            <SocialIcon Icon={Instagram} href="https://www.instagram.com/interviewcoder/" platform="instagram" />
                            <SocialIcon Icon={Youtube} href="https://www.youtube.com/@InterviewCoder-official" platform="youtube" />
                        </div>

                        <a
                            href="https://interviewcoder.tolt.io/"
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => import('../lib/analytics').then(m => m.trackEvent('footer_affiliate_click'))}
                            className="group flex items-center gap-2 bg-neutral-900/80 border border-neutral-700/50 hover:border-neutral-600 rounded-lg px-4 py-3 w-fit transition-all duration-300"
                        >
                            <span className="text-neutral-200 text-sm font-medium">Become an Affiliate</span>
                            <span className="text-neutral-500 text-xs">Earn 40% commission</span>
                        </a>

                        <div className="mt-7 bg-neutral-900 border border-neutral-800 rounded-full px-3 py-1 flex items-center gap-2 w-fit select-none">
                            <div className="relative">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-neutral-400 text-xs">All systems online</span>
                        </div>
                        <div className="mt-3 text-[13px] select-none text-neutral-500">© 2025 Co-Interview. All rights reserved.</div>
                    </div>

                    {/* Links Columns */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-10 w-full lg:w-auto">
                        <nav aria-label="Legal information">
                            <h2 className="text-neutral-300 font-bold select-none text-lg mb-4">Legal</h2>
                            <ul className="space-y-4 text-[15px] text-neutral-300">
                                {footerLinks.legal.map(item => (
                                    <li key={item.name}>
                                        <Link to={item.href} className="transition-colors hover:text-yellow-400">
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <nav aria-label="Site navigation">
                            <h2 className="text-neutral-300 font-bold select-none text-lg mb-4">Pages</h2>
                            <ul className="space-y-4 text-[15px] text-neutral-300">
                                {footerLinks.pages.slice(0, 6).map(item => (
                                    <li key={item.name}>
                                        {item.href.startsWith('http') ? (
                                            <a
                                                href={item.href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-colors hover:text-yellow-400"
                                            >
                                                {item.name}
                                            </a>
                                        ) : (
                                            <Link to={item.href} className="transition-colors hover:text-yellow-400">
                                                {item.name}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <nav aria-label="Platform comparisons">
                            <h2 className="text-neutral-300 font-bold select-none text-lg mb-4">Compare</h2>
                            <ul className="space-y-4 text-[15px] text-neutral-300">
                                {footerLinks.compare.map(item => (
                                    <li key={item.name}>
                                        <Link to={item.href} className="transition-colors hover:text-yellow-400">
                                            {item.name}
                                        </Link>
                                    </li>
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

export default Footer;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Home, FileText, DollarSign, Clock, User, LogOut, Loader2 } from 'lucide-react';

const sidebarItems = [
    { name: 'Home', icon: Home, href: '/dashboard' },
    { name: 'Real Interview Examples', icon: FileText, href: '/still_working' },
    { name: 'Pricing', icon: DollarSign, href: '/dashboard/pricing' },
    { name: 'Changelog', icon: Clock, href: '/dashboard/changelog' },
    { name: 'Profile', icon: User, href: '/dashboard/profile' },
];

import { pricingTiers } from '../content/pricing';

const DashboardLayout: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [countdown, setCountdown] = useState({ hours: 19, minutes: 28, seconds: 0 });

    const proTier = pricingTiers.find(t => t.id === 'pro');

    useEffect(() => {
        if (!loading && !user) {
            navigate('/signin');
        }
    }, [user, loading, navigate]);

    // Countdown timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown(prev => {
                let { hours, minutes, seconds } = prev;
                if (seconds > 0) {
                    seconds--;
                } else if (minutes > 0) {
                    minutes--;
                    seconds = 59;
                } else if (hours > 0) {
                    hours--;
                    minutes = 59;
                    seconds = 59;
                }
                return { hours, minutes, seconds };
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <Loader2 className="w-8 h-8 text-[#FACC15] animate-spin" />
            </div>
        );
    }

    const isActiveRoute = (href: string) => {
        if (href === '/dashboard') {
            return location.pathname === '/dashboard';
        }
        return location.pathname.startsWith(href);
    };

    return (
        <div className="min-h-screen bg-black flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col">
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <img src="/favicon.png" alt="Co-Interview" className="w-8 h-8" />
                    <span className="text-lg font-bold text-white">Interview Coder</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2">
                    {sidebarItems.map(item => (
                        <Link
                            key={item.name}
                            to={item.href}
                            onClick={() => {
                                import('../lib/analytics').then(({ trackEvent }) => {
                                    trackEvent('dashboard_nav_click', {
                                        section: item.name.toLowerCase().replace(/\s+/g, '_'),
                                        destination: item.href,
                                    });
                                });
                            }}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${isActiveRoute(item.href) ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                        </Link>
                    ))}
                </nav>

                {/* Promo Card */}
                <div className="p-4">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4">
                        <p className="text-sm text-gray-400 mb-2">
                            Get <span className="text-[#FACC15] font-bold">UNLIMITED</span> access
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                            <img src="/favicon.png" alt="Pro" className="w-6 h-6" />
                            <div>
                                <span className="text-white font-semibold text-sm block">{proTier?.name || 'Interview Coder Pro'}</span>
                                <span className="text-[#FACC15] text-xs font-bold">${proTier?.price || '19.99'} / 14 days</span>
                            </div>
                        </div>
                        <div className="flex justify-center gap-2 mb-3 text-white font-mono">
                            <div className="text-center">
                                <div className="text-xl font-bold">{String(countdown.hours).padStart(2, '0')}</div>
                                <div className="text-[10px] text-gray-500">Hours</div>
                            </div>
                            <div className="text-xl font-bold">:</div>
                            <div className="text-center">
                                <div className="text-xl font-bold">{String(countdown.minutes).padStart(2, '0')}</div>
                                <div className="text-[10px] text-gray-500">Mins</div>
                            </div>
                            <div className="text-xl font-bold">:</div>
                            <div className="text-center">
                                <div className="text-xl font-bold">{String(countdown.seconds).padStart(2, '0')}</div>
                                <div className="text-[10px] text-gray-500">Sec</div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate('/dashboard/pricing')}
                            className="w-full bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] text-black font-semibold py-2 px-4 rounded-lg text-sm hover:brightness-110 transition-all"
                        >
                            ✦ Get Access Now
                        </button>
                    </div>
                </div>

                {/* Logout */}
                <div className="p-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors w-full"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default DashboardLayout;

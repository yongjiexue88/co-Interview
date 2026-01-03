import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../hooks/useAuth';
import { Home, FileText, History, DollarSign, Clock, User, Download, Play, ChevronDown, ChevronUp, LogOut, Loader2 } from 'lucide-react';

// Platform data with icons and status
const platforms = [
    { id: 1, name: 'Microsoft Teams', icon: '🟣', lastUpdated: '11hrs ago', status: 'Undetectable' },
    { id: 2, name: 'Zoom', icon: '🔵', lastUpdated: '6hrs ago', status: 'Undetectable' },
    { id: 3, name: 'Google Meet', icon: '🟢', lastUpdated: '4hrs ago', status: 'Undetectable' },
    { id: 4, name: 'Amazon Chime', icon: '🟡', lastUpdated: '1hr ago', status: 'Undetectable' },
    { id: 5, name: 'Cisco Webex', icon: '🟢', lastUpdated: '10hrs ago', status: 'Undetectable' },
    { id: 6, name: 'Lark/Feishu', icon: '🔵', lastUpdated: '14hrs ago', status: 'Undetectable' },
    { id: 7, name: 'Hackerrank', icon: '🟢', lastUpdated: '11hrs ago', status: 'Undetectable' },
    { id: 8, name: 'CoderPad', icon: '🔴', lastUpdated: '23hrs ago', status: 'Undetectable' },
    { id: 9, name: 'Codility', icon: '⚫', lastUpdated: '7hrs ago', status: 'Undetectable' },
];

const sidebarItems = [
    { name: 'Home', icon: Home, href: '/dashboard' },
    { name: 'Real Interview Examples', icon: FileText, href: '/still_working' },
    { name: 'Previous Versions', icon: History, href: '/still_working' },
    { name: 'Pricing', icon: DollarSign, href: '/#pricing' },
    { name: 'Changelog', icon: Clock, href: '/still_working' },
    { name: 'Profile', icon: User, href: '/still_working' },
];

const UserDashboard: React.FC = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [countdown, setCountdown] = useState({ hours: 19, minutes: 28, seconds: 0 });
    const [expandedPlatform, setExpandedPlatform] = useState<number | null>(null);

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

    const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

    return (
        <div className="min-h-screen bg-black flex">
            {/* Sidebar */}
            <aside className="w-64 bg-[#0a0a0a] border-r border-white/10 flex flex-col">
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <img src="https://www.interviewcoder.co/logo.svg" alt="Co-Interview" className="w-8 h-8" />
                    <span className="text-lg font-bold text-white">Co-Interview</span>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-2">
                    {sidebarItems.map(item => (
                        <Link
                            key={item.name}
                            to={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                                item.name === 'Home' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
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
                            Get <span className="text-[#FACC15] font-bold">10%</span> off on
                        </p>
                        <div className="flex items-center gap-2 mb-3">
                            <img src="https://www.interviewcoder.co/logo.svg" alt="Pro" className="w-6 h-6" />
                            <span className="text-white font-semibold text-sm">Co-Interview Pro</span>
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
                                <div className="text-[10px] text-gray-500">Secs</div>
                            </div>
                        </div>
                        <button className="w-full bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] text-black font-semibold py-2 px-4 rounded-lg text-sm hover:brightness-110 transition-all">
                            ✦ Get Lifetime package
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
                <div className="max-w-4xl mx-auto px-8 py-12">
                    {/* Welcome Section */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-white mb-2">Welcome {userName.toUpperCase()},</h1>
                        <p className="text-3xl text-white">Let's start your free trial:</p>
                    </div>

                    {/* Upgrade Banner */}
                    <div className="mb-8">
                        <p className="text-center text-gray-400 mb-4">
                            Or upgrade now and get <span className="text-[#FACC15] font-bold">10%</span> for lifetime package
                        </p>
                        <div className="bg-[#1a1a1a] border border-[#FACC15]/30 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <img src="https://www.interviewcoder.co/logo.svg" alt="Pro" className="w-8 h-8" />
                                <span className="text-white font-semibold">Co-Interview Pro</span>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="flex gap-2 text-white font-mono text-lg">
                                    <span>{String(countdown.hours).padStart(2, '0')}</span>
                                    <span className="text-gray-500">:</span>
                                    <span>{String(countdown.minutes).padStart(2, '0')}</span>
                                    <span className="text-gray-500">:</span>
                                    <span>{String(countdown.seconds).padStart(2, '0')}</span>
                                </div>
                                <div className="text-gray-500 text-sm flex gap-4">
                                    <span>Hours</span>
                                    <span>Mins</span>
                                    <span>Secs</span>
                                </div>
                                <button className="bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] text-black font-semibold py-2 px-4 rounded-lg text-sm hover:brightness-110 transition-all">
                                    ✦ Get Lifetime package
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Download Cards */}
                    <div className="grid grid-cols-2 gap-6 mb-12">
                        {/* Mac Download */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 text-center">
                            <div className="w-16 h-16 bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <img src="https://www.interviewcoder.co/logo.svg" alt="Mac" className="w-10 h-10" />
                            </div>
                            <div className="text-xs text-gray-500 mb-1">🍎</div>
                            <h3 className="text-white font-semibold mb-1">Co-Interview Free</h3>
                            <p className="text-gray-500 text-sm mb-4">Version: 2.0.0 - Latest</p>
                            <button className="w-full border border-white/20 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                                <Download className="w-4 h-4" />
                                Download for Mac
                            </button>
                        </div>

                        {/* Windows Download */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 text-center">
                            <div className="w-16 h-16 bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <img src="https://www.interviewcoder.co/logo.svg" alt="Windows" className="w-10 h-10" />
                            </div>
                            <div className="text-xs text-gray-500 mb-1">⊞</div>
                            <h3 className="text-white font-semibold mb-1">Co-Interview Free</h3>
                            <p className="text-gray-500 text-sm mb-4">Version: 2.0.0 - Latest</p>
                            <button className="w-full border border-white/20 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-white/5 transition-colors">
                                <Download className="w-4 h-4" />
                                Download for Windows
                            </button>
                        </div>
                    </div>

                    {/* Video Demo Section */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white text-center mb-2">Inside Co-Interview 2.0</h2>
                        <p className="text-gray-400 text-center mb-6">See how Co-Interview 2.0 works.</p>
                        <div className="relative aspect-video bg-[#1a1a1a] rounded-xl overflow-hidden border border-white/10">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <button className="w-16 h-16 bg-[#FACC15] rounded-full flex items-center justify-center hover:brightness-110 transition-all">
                                    <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                                </button>
                            </div>
                            <div className="absolute bottom-4 left-4 right-4 text-center">
                                <span className="text-xl font-bold">
                                    Inside <span className="text-[#FACC15]">Co-Interview</span> 2.0
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Platform Uptime Section */}
                    <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white text-center mb-8">100% uptime all possible platforms</h2>

                        {/* Platform List */}
                        <div className="space-y-3">
                            {platforms.map(platform => (
                                <div key={platform.id} className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setExpandedPlatform(expandedPlatform === platform.id ? null : platform.id)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-500 text-sm w-8">#{String(platform.id).padStart(2, '0')}</span>
                                            <span className="text-2xl">{platform.icon}</span>
                                            <span className="text-white font-medium">{platform.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                <span className="text-gray-400 text-sm">Last updated {platform.lastUpdated}</span>
                                            </div>
                                            <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/30">
                                                {platform.status}
                                            </span>
                                            {expandedPlatform === platform.id ? (
                                                <ChevronUp className="w-5 h-5 text-gray-400" />
                                            ) : (
                                                <ChevronDown className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </button>
                                    {expandedPlatform === platform.id && (
                                        <div className="px-4 pb-4 pt-0">
                                            <div className="bg-[#111] rounded-lg overflow-hidden border border-green-500/30">
                                                {/* Progress Bar Header */}
                                                <div className="p-4 border-b border-white/10">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-gray-400 text-sm">Watch how its undetectable on {platform.name}</span>
                                                        <span className="text-green-400 text-sm font-medium">100% Uptime</span>
                                                    </div>
                                                    {/* Animated Progress Bars */}
                                                    <div className="flex gap-[2px]">
                                                        {Array.from({ length: 50 }).map((_, i) => (
                                                            <div
                                                                key={i}
                                                                className="flex-1 h-3 bg-green-500 rounded-sm animate-pulse"
                                                                style={{ animationDelay: `${i * 20}ms` }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* See How Section */}
                                                <div className="p-6 text-center">
                                                    <h3 className="text-xl font-bold text-white mb-4">
                                                        See How We are <span className="text-[#FACC15]">Undetectable</span> in {platform.name}
                                                    </h3>

                                                    {/* Play Button */}
                                                    <div className="mb-6">
                                                        <button className="w-12 h-12 bg-[#FACC15] rounded-full flex items-center justify-center mx-auto hover:brightness-110 transition-all">
                                                            <Play className="w-6 h-6 text-black ml-0.5" fill="currentColor" />
                                                        </button>
                                                    </div>

                                                    {/* Platform Icons */}
                                                    <div className="flex justify-center items-center gap-8 mb-8">
                                                        <img src="https://www.interviewcoder.co/logo.svg" alt="Co-Interview" className="w-12 h-12" />
                                                        <span className="text-3xl">{platform.icon}</span>
                                                    </div>
                                                </div>

                                                {/* Candidate & Interviewer Views */}
                                                <div className="grid grid-cols-1 gap-4 p-4 bg-[#0a0a0a]">
                                                    {/* Candidate View */}
                                                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="text-white font-semibold text-lg">Candidate View</h4>
                                                            <span className="px-2 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/30">
                                                                Hidden
                                                            </span>
                                                        </div>
                                                        <div className="aspect-video bg-[#111] rounded-lg flex items-center justify-center border border-white/5">
                                                            <div className="text-center">
                                                                <div className="text-4xl mb-2">👤</div>
                                                                <p className="text-gray-400 text-sm">Co-Interview overlay is invisible</p>
                                                                <p className="text-gray-500 text-xs">to screen sharing & recordings</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Interviewer View */}
                                                    <div className="bg-[#1a1a1a] rounded-lg p-4 border border-white/10">
                                                        <div className="flex items-center justify-between mb-3">
                                                            <h4 className="text-white font-semibold text-lg">Interviewer View</h4>
                                                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/30">
                                                                What they see
                                                            </span>
                                                        </div>
                                                        <div className="aspect-video bg-[#111] rounded-lg flex items-center justify-center border border-white/5">
                                                            <div className="text-center">
                                                                <div className="text-4xl mb-2">🎥</div>
                                                                <p className="text-gray-400 text-sm">Clean screen share</p>
                                                                <p className="text-gray-500 text-xs">No trace of Co-Interview</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Blog Link */}
                    <div className="text-center py-8">
                        <p className="text-[#FACC15] text-lg mb-2">and all the interview softwares...</p>
                        <p className="text-gray-400">
                            Here's why:{' '}
                            <Link to="/still_working" className="text-[#FACC15] underline hover:brightness-110 transition-all">
                                a detailed technological blog
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard;

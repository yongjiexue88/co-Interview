import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Download, Search, Users, LogOut, TrendingUp, Calendar, MousePointer, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import KPISummaryPanel from '../components/KPISummaryPanel';

interface UserData {
    id: string;
    email: string;
    source: string;
    createdAt: Timestamp;
    intent?: string;
}

interface AnalyticsEvent {
    id: string;
    eventName: string;
    params: any;
    createdAt: Timestamp;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserData[]>([]);
    const [analyticsEvents, setAnalyticsEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        today: 0,
        thisWeek: 0,
        bySource: { hero: 0, final_cta: 0, navbar: 0 } as Record<string, number>,
    });

    const calculateStats = (data: UserData[]) => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));

        const newStats = {
            total: data.length,
            today: 0,
            thisWeek: 0,
            bySource: { hero: 0, final_cta: 0, navbar: 0 },
        };

        data.forEach(user => {
            const date = user.createdAt?.toDate ? user.createdAt.toDate() : new Date();

            if (date >= startOfDay) newStats.today++;
            if (date >= startOfWeek) newStats.thisWeek++;

            if (newStats.bySource[user.source] !== undefined) {
                newStats.bySource[user.source]++;
            } else {
                // Initialize if undefined source encountered (fallback)
                newStats.bySource[user.source] = 1;
            }
        });

        setStats(newStats);
    };



    useEffect(() => {
        const fetchData = async () => {
            try {
                const q = query(collection(db, 'preregistrations'), orderBy('createdAt', 'desc'));
                const snapshot = await getDocs(q);
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as UserData[];

                // Fetch Analytics Events
                const analyticsQ = query(collection(db, 'analytics_events'), orderBy('createdAt', 'desc'));
                const analyticsSnapshot = await getDocs(analyticsQ);
                const analyticsData = analyticsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                })) as AnalyticsEvent[];

                setUsers(data);
                setAnalyticsEvents(analyticsData);
                calculateStats(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleExportCSV = () => {
        const headers = ['Email', 'Source', 'Intent', 'Date Joined', 'Time'];
        const csvContent = [
            headers.join(','),
            ...users.map(user => {
                const date = user.createdAt?.toDate ? user.createdAt.toDate() : new Date();
                return [user.email, user.source, user.intent || '-', date.toLocaleDateString(), date.toLocaleTimeString()].join(',');
            }),
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `preregistrations_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleLogout = () => {
        auth.signOut();
        navigate('/admin/login');
    };

    const getDailyData = () => {
        const dailyCounts: Record<string, number> = {};
        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            dailyCounts[d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })] = 0;
        }

        // Fill with actual data
        users.forEach(user => {
            const date = user.createdAt?.toDate ? user.createdAt.toDate() : new Date();
            const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (dailyCounts[key] !== undefined) {
                dailyCounts[key]++;
            }
        });

        return Object.entries(dailyCounts).map(([name, count]) => ({ name, count }));
    };

    const getAnalyticsStats = () => {
        // Interest Heatmap (Nav Clicks)
        const navClicks: Record<string, number> = {};
        analyticsEvents
            .filter(e => e.eventName === 'nav_click' || e.eventName === 'mobile_nav_click')
            .forEach(e => {
                const label = e.params?.label || 'Unknown';
                navClicks[label] = (navClicks[label] || 0) + 1;
            });

        // Conversion Funnel
        const pageViews = analyticsEvents.filter(e => e.eventName === 'page_view').length;
        const signups = users.length;
        const conversionRate = pageViews > 0 ? ((signups / pageViews) * 100).toFixed(1) : '0';

        // Engagement Metrics
        const pageLeaves = analyticsEvents.filter(e => e.eventName === 'page_leave');
        const totalDuration = pageLeaves.reduce((acc, curr) => acc + (curr.params?.duration_seconds || 0), 0);
        const avgDuration = pageLeaves.length > 0 ? Math.round(totalDuration / pageLeaves.length) : 0;

        // Scroll Depth Distribution
        const scrollDepths: Record<string, number> = { '25%': 0, '50%': 0, '75%': 0, '100%': 0 };
        analyticsEvents
            .filter(e => e.eventName === 'scroll_depth')
            .forEach(e => {
                const p = e.params?.percentage;
                if (p === 25) scrollDepths['25%']++;
                if (p === 50) scrollDepths['50%']++;
                if (p === 75) scrollDepths['75%']++;
                if (p === 90 || p === 100) scrollDepths['100%']++;
            });

        return {
            navClicks: Object.entries(navClicks)
                .map(([name, value]) => ({ name, value }))
                .sort((a, b) => b.value - a.value),
            funnel: [
                { name: 'Page Views', value: pageViews, fill: '#8884d8' },
                { name: 'Signups', value: signups, fill: '#82ca9d' },
            ],
            conversionRate,
            avgDuration,
            scrollDepths: Object.entries(scrollDepths).map(([name, value]) => ({ name, value })),
        };
    };

    const analyticsStats = getAnalyticsStats();

    const filteredUsers = users.filter(user => user.email.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white p-8 pt-24">
                <div className="max-w-7xl mx-auto animate-pulse space-y-8">
                    <div className="h-8 bg-gray-800 w-48 rounded mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-32 bg-gray-800 rounded-xl"></div>
                        ))}
                    </div>
                    <div className="h-96 bg-gray-800 rounded-xl"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Dashboard</h1>
                        <p className="text-gray-400">Manage preregistrations and analytics</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-[#FACC15] text-black font-semibold rounded-lg hover:bg-yellow-400 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

                <KPISummaryPanel users={users} events={analyticsEvents} />

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                <Users className="w-6 h-6 text-blue-500" />
                            </div>
                            <span className="text-green-500 text-sm font-medium flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" /> Live
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold">{stats.total}</h3>
                        <p className="text-gray-400 text-sm">Total Signups</p>
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Calendar className="w-6 h-6 text-green-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold">{stats.today}</h3>
                        <p className="text-gray-400 text-sm">New Today</p>
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-purple-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold">{stats.thisWeek}</h3>
                        <p className="text-gray-400 text-sm">This Week</p>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-6">Signups Over Time (Last 7 Days)</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={getDailyData()}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#666" fontSize={12} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                        labelStyle={{ color: '#999' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#FACC15"
                                        strokeWidth={2}
                                        dot={{ fill: '#FACC15', strokeWidth: 2 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                        <h3 className="text-lg font-bold mb-6">Signups by Source</h3>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={Object.entries(stats.bySource).map(([name, value]) => ({ name, value }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#666" fontSize={12} tickLine={false} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: '#33333333' }}
                                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="value" fill="#FACC15" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Activity className="w-6 h-6 text-[#FACC15]" />
                        User Behavior Analytics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Interest Heatmap */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <MousePointer className="w-5 h-5 text-blue-400" />
                                Top Interests (Nav Clicks)
                            </h3>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={analyticsStats.navClicks} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                                        <XAxis type="number" stroke="#666" fontSize={12} tickLine={false} />
                                        <YAxis dataKey="name" type="category" stroke="#999" fontSize={12} tickLine={false} width={100} />
                                        <Tooltip
                                            cursor={{ fill: '#33333333' }}
                                            contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px' }}
                                        />
                                        <Bar dataKey="value" fill="#60A5FA" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Conversion Funnel Card */}
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6 flex flex-col justify-center items-center text-center">
                            <h3 className="text-lg font-bold mb-2 text-gray-400">Conversion Rate</h3>
                            <div className="text-6xl font-bold text-green-500 mb-4">{analyticsStats.conversionRate}%</div>
                            <div className="flex gap-8 text-sm">
                                <div>
                                    <div className="text-2xl font-bold text-white mb-1">{analyticsStats.funnel[0].value}</div>
                                    <div className="text-gray-500">Page Views</div>
                                </div>
                                <div className="text-gray-600 text-2xl">→</div>
                                <div>
                                    <div className="text-2xl font-bold text-white mb-1">{analyticsStats.funnel[1].value}</div>
                                    <div className="text-gray-500">Signups</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h3 className="text-lg font-bold">Recent Signups</h3>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search emails..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#FACC15]/50 transition-colors"
                            />
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-black/50 text-gray-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Source</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-medium">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${user.source === 'hero'
                                                        ? 'bg-blue-500/20 text-blue-400'
                                                        : user.source === 'final_cta'
                                                            ? 'bg-purple-500/20 text-purple-400'
                                                            : 'bg-gray-500/20 text-gray-400'
                                                        }`}
                                                >
                                                    {user.source}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">
                                                {user.createdAt?.toDate ? user.createdAt.toDate().toLocaleTimeString() : 'N/A'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                                            No users found matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

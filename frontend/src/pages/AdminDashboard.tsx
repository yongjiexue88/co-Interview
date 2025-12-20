import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
    Search,
    Users,
    LogOut,
    Ban,
    CheckCircle,
    Edit2,
    X,
    Save,
    Shield,
    PlusCircle,
    Eye,
    MousePointer,
    Activity,
    Zap,
    Clock,
    XCircle,
    Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import KPISummaryPanel, { AnalyticsEvent } from '../components/KPISummaryPanel';
import UserDetailsModal from '../components/UserDetailsModal';
import { UserData } from '../types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

interface SystemHealth {
    geminiKeyConfigured: boolean;
    activeSessionsCount: number;
    aggregateStats: {
        totalQuotaUsedSeconds: number;
        totalQuotaUsedMinutes: number;
        sampleUserCount: number;
    };
    plans: Array<{ id: string; name: string; quotaSecondsMonth: number; sessionMaxDuration: number }>;
    timestamp: string;
}

interface ActiveSession {
    id: string;
    userId: string;
    userEmail: string;
    model: string;
    startedAt: string;
    tokenExpiresAt: string;
    lastHeartbeatAt: string;
    planIdAtStart: string;
}

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [gaData, setGaData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<UserData>>({});

    // Modal State
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // System Health & Active Sessions
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
    const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
    const [terminatingSession, setTerminatingSession] = useState<string | null>(null);

    // Fetch users AND analytics from backend
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = await user?.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };

            const [usersRes, analyticsRes, healthRes, sessionsRes] = await Promise.all([
                fetch(`${API_URL}/admin/users?limit=100`, { headers }),
                fetch(`${API_URL}/admin/analytics?limit=1000`, { headers }),
                fetch(`${API_URL}/admin/system/health`, { headers }),
                fetch(`${API_URL}/admin/sessions/active`, { headers }),
            ]);

            if (usersRes.ok) {
                const data = await usersRes.json();
                setUsers(data.users);
            } else {
                console.error('Failed to fetch users');
            }

            if (analyticsRes.ok) {
                const data = await analyticsRes.json();
                setEvents(data.events);
            } else {
                console.error('Failed to fetch analytics');
            }

            if (healthRes.ok) {
                const data = await healthRes.json();
                setSystemHealth(data);
            }

            if (sessionsRes.ok) {
                const data = await sessionsRes.json();
                setActiveSessions(data.sessions);
            }

            // Fetch GA Data
            const gaRes = await fetch(`${API_URL}/admin/analytics/ga`, { headers });
            if (gaRes.ok) {
                const data = await gaRes.json();
                setGaData(data);
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user, fetchData]);

    const handleLogout = () => {
        auth.signOut();
        navigate('/admin/login');
    };

    const handleEditClick = (user: UserData) => {
        setEditingUserId(user.id);
        setEditForm({
            // Fallback to V1 fields if V2 is missing
            plan: user.access?.planId || user.plan,
            status: user.access?.accessStatus || user.status,
            quotaSecondsMonth: user.usage?.quotaSecondsMonth || user.quotaSecondsMonth,
        });
    };

    const handleViewDetails = (user: UserData) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleCancelEdit = () => {
        setEditingUserId(null);
        setEditForm({});
    };

    const handleSaveEdit = async (userId: string) => {
        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(editForm),
            });

            if (response.ok) {
                // Refresh list
                await fetchData();
                setEditingUserId(null);
            } else {
                alert('Failed to update user');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('Update failed');
        }
    };

    const handleToggleBan = async (userId: string, currentStatus?: string) => {
        const status = currentStatus || 'active';
        const action = status === 'banned' ? 'enable' : 'disable';
        if (!confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${API_URL}/admin/users/${userId}/${action}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: 'Admin toggle' }),
            });

            if (response.ok) {
                await fetchData();
            } else {
                alert(`Failed to ${action} user`);
            }
        } catch (error) {
            console.error('Action failed:', error);
            alert('Action failed');
        }
    };

    const handleSeedUser = async () => {
        if (!confirm('This will create a dummy user with full V2 schema data. Continue?')) return;
        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${API_URL}/admin/users/seed-v2`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });

            if (response.ok) {
                alert('Test user created!');
                await fetchData();
            } else {
                const err = await response.json();
                alert('Failed to seed user: ' + (err.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Seed failed:', error);
            alert('Seed failed');
        }
    };

    const handleTerminateSession = async (sessionId: string) => {
        if (!confirm('Force-terminate this session? The user will be disconnected.')) return;
        setTerminatingSession(sessionId);
        try {
            const token = await user?.getIdToken();
            const response = await fetch(`${API_URL}/admin/sessions/${sessionId}/terminate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ reason: 'admin_terminated' }),
            });

            if (response.ok) {
                await fetchData();
            } else {
                alert('Failed to terminate session');
            }
        } catch (error) {
            console.error('Terminate failed:', error);
            alert('Terminate failed');
        } finally {
            setTerminatingSession(null);
        }
    };

    const filteredUsers = users.filter(u => u.email?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="min-h-screen bg-black text-white p-4 md:p-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Shield className="w-8 h-8 text-[#FACC15]" />
                            Admin Dashboard
                        </h1>
                        <p className="text-gray-400">Total Users: {users.length}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSeedUser}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors border border-blue-500/30"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Seed Test User
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

                {/* Analytics Panel */}
                <KPISummaryPanel users={users as any} events={events} />

                {/* Google Analytics Traffic Card */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-blue-400" />
                            Active Users (28d)
                        </div>
                        <div className="text-3xl font-bold text-white">{gaData?.activeUsers?.toLocaleString() || (gaData?.error ? '-' : '...')}</div>
                        {gaData?.error && <div className="text-xs text-red-400 mt-1">Config Required</div>}
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                            <Eye className="w-4 h-4 text-green-400" />
                            Page Views (28d)
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {gaData?.screenPageViews?.toLocaleString() || (gaData?.error ? '-' : '...')}
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                            <MousePointer className="w-4 h-4 text-purple-400" />
                            Session Count (28d)
                        </div>
                        <div className="text-3xl font-bold text-white">{gaData?.sessions?.toLocaleString() || (gaData?.error ? '-' : '...')}</div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-yellow-400" />
                            Event Count (28d)
                        </div>
                        <div className="text-3xl font-bold text-white">{gaData?.eventCount?.toLocaleString() || (gaData?.error ? '-' : '...')}</div>
                    </div>
                </div>

                {/* System Health & API Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            Gemini API Key
                        </div>
                        <div className={`text-2xl font-bold ${systemHealth?.geminiKeyConfigured ? 'text-green-400' : 'text-red-400'}`}>
                            {systemHealth?.geminiKeyConfigured ? '✓ Configured' : '✗ Missing'}
                        </div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                            <Activity className="w-4 h-4 text-green-400" />
                            Active Sessions
                        </div>
                        <div className="text-2xl font-bold text-white">{activeSessions.length}</div>
                    </div>

                    <div className="bg-[#1a1a1a] border border-white/10 p-6 rounded-xl">
                        <div className="text-gray-400 text-sm mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-400" />
                            Platform Quota Used
                        </div>
                        <div className="text-2xl font-bold text-white">
                            {systemHealth?.aggregateStats?.totalQuotaUsedMinutes?.toLocaleString() || 0} mins
                        </div>
                        <div className="text-xs text-gray-500 mt-1">Sample: {systemHealth?.aggregateStats?.sampleUserCount || 0} users</div>
                    </div>
                </div>

                {/* Active Sessions Table */}
                {activeSessions.length > 0 && (
                    <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-green-400" />
                                Live Sessions ({activeSessions.length})
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-black/50 text-gray-400 font-medium">
                                    <tr>
                                        <th className="px-4 py-3">User</th>
                                        <th className="px-4 py-3">Started</th>
                                        <th className="px-4 py-3">Expires</th>
                                        <th className="px-4 py-3">Plan</th>
                                        <th className="px-4 py-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {activeSessions.map(session => (
                                        <tr key={session.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="text-white text-xs">{session.userEmail}</div>
                                                <div className="text-[10px] text-gray-600 font-mono">{session.id.substring(0, 16)}...</div>
                                            </td>
                                            <td className="px-4 py-3 text-gray-400 text-xs">{new Date(session.startedAt).toLocaleTimeString()}</td>
                                            <td className="px-4 py-3 text-xs">
                                                <span className={new Date(session.tokenExpiresAt) < new Date() ? 'text-red-400' : 'text-green-400'}>
                                                    {new Date(session.tokenExpiresAt).toLocaleTimeString()}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-gray-300">
                                                    {session.planIdAtStart}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleTerminateSession(session.id)}
                                                    disabled={terminatingSession === session.id}
                                                    className="px-2 py-1 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded transition-colors border border-red-500/20 disabled:opacity-50"
                                                >
                                                    {terminatingSession === session.id ? (
                                                        <Loader2 className="w-3 h-3 animate-spin inline" />
                                                    ) : (
                                                        <XCircle className="w-3 h-3 inline mr-1" />
                                                    )}
                                                    Terminate
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            User Management
                        </h3>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search email..."
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
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Quota</th>
                                    <th className="px-6 py-4">Tokens</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => {
                                        // Resolution logic for V2/V1 fields
                                        const plan = user.planId || user.access?.planId || user.plan || 'free';
                                        const status = user.status || user.access?.accessStatus || 'active';
                                        const created = user.createdAt || user.profile?.createdAt;
                                        const quotaPercent = user.quotaPercent || 0;
                                        const tokensUsed = user.tokensUsed || 0;

                                        // Format token count (e.g., 1.2M, 500K)
                                        const formatTokens = (num: number) => {
                                            if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
                                            if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
                                            return num.toString();
                                        };

                                        return (
                                            <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="font-medium text-white">{user.email || user.profile?.email}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{user.id}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {editingUserId === user.id ? (
                                                        <select
                                                            value={editForm.plan}
                                                            onChange={e => setEditForm({ ...editForm, plan: e.target.value as any })}
                                                            className="bg-black border border-white/20 rounded px-2 py-1 text-white"
                                                        >
                                                            <option value="free">Free</option>
                                                            <option value="pro">Pro</option>
                                                            <option value="lifetime">Lifetime</option>
                                                        </select>
                                                    ) : (
                                                        <span
                                                            className={`px-2 py-1 rounded text-xs font-semibold ${
                                                                plan === 'pro' || plan === 'lifetime'
                                                                    ? 'bg-[#FACC15]/20 text-[#FACC15]'
                                                                    : 'bg-gray-500/20 text-gray-400'
                                                            }`}
                                                        >
                                                            {plan.toUpperCase()}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="w-20">
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full transition-all ${
                                                                        quotaPercent >= 90
                                                                            ? 'bg-red-500'
                                                                            : quotaPercent >= 70
                                                                              ? 'bg-yellow-500'
                                                                              : 'bg-green-500'
                                                                    }`}
                                                                    style={{ width: `${Math.min(quotaPercent, 100)}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs text-gray-400 w-10 text-right">{quotaPercent}%</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-mono text-gray-300">{formatTokens(tokensUsed)}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span
                                                        className={`px-2 py-1 rounded text-xs ${
                                                            status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                        }`}
                                                    >
                                                        {status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-400">
                                                    {created ? new Date(created).toLocaleDateString() : 'N/A'}
                                                </td>
                                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                    {editingUserId === user.id ? (
                                                        <>
                                                            <button
                                                                onClick={handleCancelEdit}
                                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400"
                                                                title="Cancel"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleSaveEdit(user.id)}
                                                                className="p-2 bg-green-500/20 text-green-400 hover:bg-green-500/30 rounded-lg"
                                                                title="Save"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleViewDetails(user)}
                                                                className="p-2 hover:bg-blue-500/20 rounded-lg text-blue-400 transition-colors"
                                                                title="View Details"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </button>

                                                            <button
                                                                onClick={() => handleEditClick(user)}
                                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                                title="Edit Details"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleBan(user.id, status)}
                                                                className={`p-2 rounded-lg transition-colors ${
                                                                    status === 'banned'
                                                                        ? 'hover:bg-green-500/20 text-green-400'
                                                                        : 'hover:bg-red-500/20 text-red-400 hover:text-red-500'
                                                                }`}
                                                                title={status === 'banned' ? 'Enable User' : 'Disable User'}
                                                            >
                                                                {status === 'banned' ? (
                                                                    <CheckCircle className="w-4 h-4" />
                                                                ) : (
                                                                    <Ban className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No users found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <UserDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} onRefresh={fetchData} />
        </div>
    );
};

export default AdminDashboard;

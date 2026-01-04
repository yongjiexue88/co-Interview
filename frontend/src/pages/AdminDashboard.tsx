import React, { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Download, Search, Users, LogOut, Ban, CheckCircle, Edit2, X, Save, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';

interface UserData {
    id: string;
    email: string;
    plan: 'free' | 'pro' | 'lifetime';
    status: 'active' | 'banned';
    quotaSecondsMonth?: number;
    quotaSecondsUsed?: number;
    concurrencyLimit?: number;
    createdAt: string;
    source?: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingUserId, setEditingUserId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<UserData>>({});

    // Fetch users from backend
    const fetchUsers = async () => {
        try {
            setLoading(true);
            const token = await user?.getIdToken();
            const response = await fetch(`${API_URL}/admin/users?limit=100`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            } else {
                console.error('Failed to fetch users');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUsers();
        }
    }, [user]);

    const handleLogout = () => {
        auth.signOut();
        navigate('/admin/login');
    };

    const handleEditClick = (user: UserData) => {
        setEditingUserId(user.id);
        setEditForm({
            plan: user.plan,
            status: user.status,
            quotaSecondsMonth: user.quotaSecondsMonth,
        });
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
                await fetchUsers();
                setEditingUserId(null);
            } else {
                alert('Failed to update user');
            }
        } catch (error) {
            console.error('Update failed:', error);
            alert('Update failed');
        }
    };

    const handleToggleBan = async (userId: string, currentStatus: string) => {
        const action = currentStatus === 'banned' ? 'enable' : 'disable';
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
                await fetchUsers();
            } else {
                alert(`Failed to ${action} user`);
            }
        } catch (error) {
            console.error('Action failed:', error);
            alert('Action failed');
        }
    };

    const filteredUsers = users.filter(u => u.email.toLowerCase().includes(searchTerm.toLowerCase()));

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
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                        </button>
                    </div>
                </div>

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
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            Loading users...
                                        </td>
                                    </tr>
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-white">{user.email}</div>
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
                                                            user.plan === 'pro' || user.plan === 'lifetime'
                                                                ? 'bg-[#FACC15]/20 text-[#FACC15]'
                                                                : 'bg-gray-500/20 text-gray-400'
                                                        }`}
                                                    >
                                                        {user.plan.toUpperCase()}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`px-2 py-1 rounded text-xs ${
                                                        user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                                    }`}
                                                >
                                                    {user.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
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
                                                            onClick={() => handleEditClick(user)}
                                                            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
                                                            title="Edit Details"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleToggleBan(user.id, user.status)}
                                                            className={`p-2 rounded-lg transition-colors ${
                                                                user.status === 'banned'
                                                                    ? 'hover:bg-green-500/20 text-green-400'
                                                                    : 'hover:bg-red-500/20 text-red-400 hover:text-red-500'
                                                            }`}
                                                            title={user.status === 'banned' ? 'Enable User' : 'Disable User'}
                                                        >
                                                            {user.status === 'banned' ? (
                                                                <CheckCircle className="w-4 h-4" />
                                                            ) : (
                                                                <Ban className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No users found.
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

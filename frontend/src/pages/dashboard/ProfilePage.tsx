import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Trash2, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../lib/firebase';
import { useNavigate } from 'react-router-dom';

type TabType = 'account' | 'billing' | 'affiliate';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('account');

    const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || '';
    const initials = userName.slice(0, 2).toUpperCase();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            <h1 className="text-4xl font-bold text-white mb-8">Profile</h1>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-white/10 mb-8">
                <button
                    onClick={() => setActiveTab('account')}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'account'
                            ? 'text-white border-b-2 border-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Your Account
                </button>
                <button
                    onClick={() => setActiveTab('billing')}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'billing'
                            ? 'text-white border-b-2 border-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Billing
                </button>
                <button
                    onClick={() => setActiveTab('affiliate')}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'affiliate'
                            ? 'text-white border-b-2 border-white'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Affiliate
                </button>
            </div>

            {activeTab === 'account' && (
                <div className="space-y-8">
                    {/* Avatar */}
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] flex items-center justify-center text-2xl font-bold text-black">
                            {initials}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Name</label>
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white">
                            {userName.toUpperCase()}
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Email</label>
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white">
                            {userEmail}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-4">
                        <button className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm">Change Password</span>
                        </button>
                        <button className="flex items-center gap-3 text-red-500 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm">Delete Account</span>
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm">Log Out</span>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="text-gray-400">
                    <p>Billing information will be displayed here.</p>
                </div>
            )}

            {activeTab === 'affiliate' && (
                <div className="text-gray-400">
                    <p>Affiliate program information will be displayed here.</p>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;

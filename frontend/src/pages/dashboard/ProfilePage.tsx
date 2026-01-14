import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type TabType = 'account' | 'billing' | 'affiliate';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<TabType>('account');
    const [billingLoading, setBillingLoading] = useState(false);
    const [plan, setPlan] = useState<any>(null); // Using any for simplicity as per existing patterns, or better define interface

    const userName = user?.displayName || user?.email?.split('@')[0] || 'User';
    const userEmail = user?.email || '';
    const initials = userName.slice(0, 2).toUpperCase();

    useEffect(() => {
        if (activeTab === 'billing') {
            fetchPlan();
        }
    }, [activeTab]);

    const fetchPlan = async () => {
        try {
            setBillingLoading(true);
            const { data } = await api.get('/users/me');
            setPlan(data.plan);
        } catch (error) {
            console.error('Failed to fetch plan:', error);
        } finally {
            setBillingLoading(false);
        }
    };

    const isPasswordUser = user?.providerData?.some(p => p.providerId === 'password');

    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            <h1 className="text-4xl font-bold text-white mb-8">Profile</h1>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-white/10 mb-8">
                <button
                    onClick={() => setActiveTab('account')}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'account' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Your Account
                </button>
                <button
                    onClick={() => setActiveTab('billing')}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'billing' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Billing
                </button>
                <button
                    onClick={() => setActiveTab('affiliate')}
                    className={`pb-3 text-sm font-medium transition-colors ${activeTab === 'affiliate' ? 'text-white border-b-2 border-white' : 'text-gray-400 hover:text-white'
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
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white">{userName.toUpperCase()}</div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Email</label>
                        <div className="bg-[#1a1a1a] border border-white/10 rounded-lg px-4 py-3 text-white">{userEmail}</div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-4">
                        {isPasswordUser && (
                            <button className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors">
                                <Lock className="w-4 h-4" />
                                <span className="text-sm">Change Password</span>
                            </button>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'billing' && (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-semibold text-white mb-2">Subscription Plan</h2>
                        <p className="text-gray-400 text-sm">Choose a plan to access all features.</p>
                    </div>

                    {billingLoading ? (
                        <div className="text-gray-400">Loading plan details...</div>
                    ) : (
                        <div className="bg-[#111111] border border-white/10 rounded-xl p-8 max-w-md">
                            {!plan || plan.id === 'free' ? (
                                <div className="text-center">
                                    <h3 className="text-white font-medium text-lg mb-2">No Active Subscription</h3>
                                    <p className="text-gray-400 text-sm mb-6">Subscribe now to get access to all features</p>
                                    <button
                                        onClick={() => navigate('/dashboard/pricing')}
                                        className="bg-[#FACC15] hover:bg-[#EAB308] text-black font-semibold py-2 px-6 rounded-lg transition-colors"
                                    >
                                        View Pricing Plans
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-white font-bold text-xl mb-1">{plan.name} Plan</h3>
                                            <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500 border border-green-500/20 uppercase">
                                                {plan.status}
                                            </span>
                                        </div>
                                    </div>

                                    {plan.periodEnd && (
                                        <div className="text-sm text-gray-400 mb-6">
                                            Renews on {new Date(plan.periodEnd * 1000).toLocaleDateString()}
                                        </div>
                                    )}

                                    <button
                                        onClick={() => navigate('/dashboard/pricing')}
                                        className="w-full border border-white/10 text-white font-medium py-2 px-4 rounded-lg hover:bg-white/5 transition-colors"
                                    >
                                        Manage Subscription
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
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

import React, { useState, useEffect } from 'react';
import { Check, Shield } from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { api } from '../../lib/api';

const features = [
    'Unlimited monthly access',
    'New: Audio support for real-time guidance',
    '20+ undetectability features for total stealth',
    'Support for all kinds of interviews(leetcode, system design, etc.)',
    'Most powerful fine tuned AI models',
    '24/7 support',
];

const PricingPage: React.FC = () => {
    useAuth();
    const [countdown, setCountdown] = useState({ hours: 19, minutes: 13, seconds: 33 });

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

    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handlePurchase = async (planId: string) => {
        try {
            setLoadingPlan(planId);
            // Track begin checkout
            import('../../lib/analytics').then(({ trackEvent }) => {
                trackEvent('begin_checkout', {
                    currency: 'USD',
                    value: planId === 'pro' ? 29 : 99,
                    items: [{ item_id: planId, item_name: planId }],
                });
            });

            const res = await api.post('/billing/checkout', { plan: planId });
            if (res.data.checkout_url) {
                window.location.href = res.data.checkout_url;
            }
        } catch (error) {
            console.error('Checkout error:', error);
            // Optionally show toast error
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto px-8 py-12">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Pricing</h1>
                <p className="text-gray-400">Simple and transparent pricing for everyone</p>
            </div>

            <div className="grid grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Monthly Pro */}
                <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-8">
                    <h2 className="text-xl font-semibold text-white mb-6">Pro</h2>
                    <div className="mb-2">
                        <span className="text-4xl font-bold text-white">$29</span>
                        <span className="text-gray-400">/30 days</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">
                        30 days of unlimited access
                    </p>

                    <button
                        onClick={() => handlePurchase('pro')}
                        disabled={!!loadingPlan}
                        className="w-full bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] text-black font-semibold py-3 px-4 rounded-lg hover:brightness-110 transition-all mb-4 disabled:opacity-50"
                    >
                        {loadingPlan === 'pro' ? 'Processing...' : 'Subscribe'}
                    </button>

                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                        <Shield className="w-4 h-4" />
                        <span>Secure checkout</span>
                    </div>

                    <div className="space-y-3">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lifetime Pro */}
                <div className="relative bg-gradient-to-b from-[#FACC15]/5 to-transparent border-2 border-[#FACC15]/30 rounded-2xl p-8">
                    {/* Discount Badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FACC15] text-black text-sm font-bold px-4 py-1 rounded-full flex items-center gap-3">
                        <span>50% off</span>
                        <span className="font-mono">
                            {String(countdown.hours).padStart(2, '0')} : {String(countdown.minutes).padStart(2, '0')} :{' '}
                            {String(countdown.seconds).padStart(2, '0')}
                        </span>
                    </div>

                    <h2 className="text-xl font-semibold text-[#FACC15] mt-4 mb-6">Lifetime</h2>
                    <div className="mb-2">
                        <span className="text-4xl font-bold text-white">$99</span>
                        <span className="text-gray-400 ml-2">One-time payment</span>
                    </div>
                    <p className="text-gray-500 text-sm mb-6">
                        Original price: <span className="line-through">$198</span>
                    </p>

                    <button
                        onClick={() => handlePurchase('lifetime')}
                        disabled={!!loadingPlan}
                        className="w-full bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] text-black font-semibold py-2 px-4 rounded-lg hover:brightness-110 transition-all mb-4 disabled:opacity-50"
                    >
                        {loadingPlan === 'lifetime' ? 'Processing...' : 'Buy now'}
                    </button>

                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-6">
                        <Shield className="w-4 h-4" />
                        <span>Secure checkout</span>
                    </div>

                    <div className="space-y-3">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <Check className="w-4 h-4 text-[#FACC15] mt-0.5 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;

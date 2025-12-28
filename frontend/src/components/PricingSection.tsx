import React from 'react';
import Button from './ui/Button';
import { trackEvent } from '../lib/analytics';
import { Check } from 'lucide-react';

const PricingSection: React.FC = () => {
    const handleNotifyClick = (tierId: string, price: string) => {
        trackEvent('pricing_tier_click', {
            tier_id: tierId,
            price_displayed: price
        });
        alert("Thanks for your interest! We'll notify you when subscriptions open.");
    };

    return (
        <section id="pricing" className="py-24 bg-black relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Invest in Your <span className="text-[#FACC15]">Career</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        A Senior Engineer salary is $150k+. Interview Coder costs less than a single rejected interview.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Weekly Tier */}
                    <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#FACC15]/30 transition-all group">
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-2">Interview Week</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">$29</span>
                                <span className="text-gray-500">/ week</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">Perfect for a specific interview loop.</p>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Unlimited Interview Support', 'Real-time Audio & Screen Analysis', 'All Languages Supported', 'Undetectable Mode'].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                    <Check className="w-4 h-4 text-[#FACC15]" />
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button
                            variant="outline"
                            className="w-full justify-center group-hover:bg-[#FACC15] group-hover:text-black group-hover:border-[#FACC15]"
                            onClick={() => handleNotifyClick('weekly', '$29')}
                        >
                            Notify Me When Available
                        </Button>
                    </div>

                    {/* Monthly Tier */}
                    <div className="bg-[#1a1a1a] border border-[#FACC15]/30 rounded-2xl p-8 relative scale-105 shadow-2xl shadow-[#FACC15]/5">
                        <div className="absolute top-0 right-0 bg-[#FACC15] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                            MOST POPULAR
                        </div>
                        <div className="mb-6">
                            <h3 className="text-xl font-semibold text-white mb-2">Monthly Pro</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold text-white">$99</span>
                                <span className="text-gray-500">/ month</span>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">For serious job hunters.</p>
                        </div>
                        <ul className="space-y-4 mb-8">
                            {['Everything in Weekly', 'Priority Support', 'New Features Early Access', 'Cancel Anytime'].map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm text-white">
                                    <div className="w-4 h-4 rounded-full bg-[#FACC15] flex items-center justify-center">
                                        <Check className="w-3 h-3 text-black" />
                                    </div>
                                    {feature}
                                </li>
                            ))}
                        </ul>
                        <Button
                            variant="primary"
                            className="w-full justify-center"
                            onClick={() => handleNotifyClick('monthly', '$99')}
                        >
                            Get Early Access
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PricingSection;

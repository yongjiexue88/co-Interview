import React, { useState, useEffect } from 'react';
import Button from './ui/Button';
import { trackEvent } from '../lib/analytics';
import { Check } from 'lucide-react';
import { pricingTiers } from '../content/pricing';

const PricingSection: React.FC = () => {
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

    const handlePurchaseClick = (tierId: string, price: number, paymentLink?: string) => {
        trackEvent('pricing_tier_click', {
            tier_id: tierId,
            price_displayed: `$${price}`,
        });

        if (tierId === 'free') {
            // Redirect to signup or app download
            window.location.href = '/signup';
            return;
        }

        if (paymentLink) {
            window.open(paymentLink, '_blank');
        } else {
            alert("Thanks for your interest! We'll notify you when this option opens.");
        }
    };

    const freeTier = pricingTiers.find(t => t.id === 'free');
    const proTier = pricingTiers.find(t => t.id === 'pro');
    const lifetime = pricingTiers.find(t => t.id === 'lifetime');

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

                <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
                    {/* Free Tier */}
                    {freeTier && (
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all group">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-white mb-2">{freeTier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">$0</span>
                                    <span className="text-gray-500">free</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">{freeTier.description}</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {freeTier.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                                        <Check className="w-4 h-4 text-gray-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                variant="outline"
                                className="w-full justify-center"
                                onClick={() => handlePurchaseClick(freeTier.id, freeTier.price)}
                            >
                                Start Free
                            </Button>
                        </div>
                    )}

                    {/* Pro - 30 Days - MOST POPULAR */}
                    {proTier && (
                        <div className="bg-[#1a1a1a] border border-[#FACC15]/30 rounded-2xl p-8 relative shadow-2xl shadow-[#FACC15]/5">
                            <div className="absolute top-0 right-0 bg-[#FACC15] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                MOST POPULAR
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-white mb-2">{proTier.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">${proTier.price}</span>
                                    <span className="text-gray-500">/ 30 days</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">{proTier.description}</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {proTier.features.map((feature, i) => (
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
                                onClick={() => handlePurchaseClick(proTier.id, proTier.price, proTier.paymentLink)}
                            >
                                Get Started
                            </Button>
                        </div>
                    )}

                    {/* Lifetime Tier - 50% OFF */}
                    {lifetime && (
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#FACC15]/30 transition-all group relative">
                            {/* 50% Off Badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#FACC15] text-black text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
                                <span>50% off</span>
                                <span className="font-mono text-xs">
                                    {String(countdown.hours).padStart(2, '0')}:{String(countdown.minutes).padStart(2, '0')}:{String(countdown.seconds).padStart(2, '0')}
                                </span>
                            </div>
                            <div className="mb-6 mt-2">
                                <h3 className="text-xl font-semibold text-white mb-2">{lifetime.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">${lifetime.price}</span>
                                    <span className="text-gray-500">one-time</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">
                                    Original: <span className="line-through">$198</span> • {lifetime.description}
                                </p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {lifetime.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                        <Check className="w-4 h-4 text-[#FACC15]" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Button
                                variant="outline"
                                className="w-full justify-center group-hover:bg-[#FACC15] group-hover:text-black group-hover:border-[#FACC15]"
                                onClick={() => handlePurchaseClick(lifetime.id, lifetime.price, lifetime.paymentLink)}
                            >
                                Get Lifetime Access
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;

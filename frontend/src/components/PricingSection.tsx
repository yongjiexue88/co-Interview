import React from 'react';
import Button from './ui/Button';
import { trackEvent } from '../lib/analytics';
import { Check } from 'lucide-react';
import { pricingTiers } from '../content/pricing';

const PricingSection: React.FC = () => {
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
    const interviewSprint = pricingTiers.find(t => t.id === 'interview-sprint');
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

                    {/* Interview Sprint - 30 Days - MOST POPULAR */}
                    {interviewSprint && (
                        <div className="bg-[#1a1a1a] border border-[#FACC15]/30 rounded-2xl p-8 relative shadow-2xl shadow-[#FACC15]/5">
                            <div className="absolute top-0 right-0 bg-[#FACC15] text-black text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                MOST POPULAR
                            </div>
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-white mb-2">{interviewSprint.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">${interviewSprint.price}</span>
                                    <span className="text-gray-500">/ 30 days</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">{interviewSprint.description}</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                {interviewSprint.features.map((feature, i) => (
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
                                onClick={() => handlePurchaseClick(interviewSprint.id, interviewSprint.price, interviewSprint.paymentLink)}
                            >
                                {interviewSprint.paymentLink ? 'Get Started' : 'Coming Soon'}
                            </Button>
                        </div>
                    )}

                    {/* Lifetime Tier */}
                    {lifetime && (
                        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 hover:border-[#FACC15]/30 transition-all group">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-white mb-2">{lifetime.name}</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">${lifetime.price}</span>
                                    <span className="text-gray-500">one-time</span>
                                </div>
                                <p className="text-sm text-gray-400 mt-2">{lifetime.description}</p>
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
                                {lifetime.paymentLink ? 'Get Lifetime Access' : 'Coming Soon'}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default PricingSection;

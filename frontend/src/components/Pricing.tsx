import React from 'react';
import { Check } from 'lucide-react';
import { PRICING_PLANS } from '../constants';
import Button from './ui/Button';

const Pricing: React.FC = () => {
    return (
        <section id="pricing" className="py-32 bg-black relative border-t border-white/5">
            {/* Ambient Light */}
            <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-[#EFCC3A]/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Simple, transparent pricing</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
                        Invest in your career for less than the price of a mock interview.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {PRICING_PLANS.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative flex flex-col p-8 rounded-3xl border transition-all duration-300 ${plan.recommended ? 'bg-[#EFCC3A]/5 border-[#EFCC3A] shadow-[0_0_40px_rgba(239,204,58,0.1)] scale-105 z-10' : 'bg-[#111] border-white/10 hover:border-white/20'}`}
                        >
                            {plan.recommended && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#EFCC3A] text-black text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                                <div className="mt-4 flex items-baseline">
                                    <span className={`text-4xl font-bold ${plan.recommended ? 'text-[#EFCC3A]' : 'text-white'}`}>{plan.price}</span>
                                    {plan.period && <span className="text-gray-500 ml-1 font-medium">{plan.period}</span>}
                                </div>
                            </div>

                            <ul className="flex-1 space-y-4 mb-8">
                                {plan.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start">
                                        <Check className={`w-5 h-5 mr-3 flex-shrink-0 ${plan.recommended ? 'text-[#EFCC3A]' : 'text-gray-500'}`} />
                                        <span className="text-gray-300 text-sm font-medium">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button variant={plan.recommended ? 'primary' : 'outline'} className="w-full">
                                {plan.buttonText}
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;

import React from 'react';
import { FEATURES } from '../constants';

const Features: React.FC = () => {
    return (
        <section id="features" className="py-32 bg-black relative border-t border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-20">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Unfair advantage? <span className="text-[#EFCC3A]">Maybe.</span>
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
                        We've built the most advanced interview assistant on the market. It's not just an overlay; it's a complete stealth
                        intelligence suite.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {FEATURES.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group p-8 rounded-3xl bg-[#111] border border-white/5 hover:border-[#EFCC3A]/30 transition-all duration-300 hover:shadow-[0_0_30px_rgba(239,204,58,0.05)]"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#EFCC3A]/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-[#EFCC3A]/20">
                                    <Icon className="w-7 h-7 text-[#EFCC3A]" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed font-medium">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Features;

import React from 'react';
import { undetectableFeatures } from '../content/siteContent';
import { Eye, EyeOff, Monitor, MousePointer } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
    '👻': <EyeOff className="w-8 h-8" />,
    '🔒': <Monitor className="w-8 h-8" />,
    '📹': <Eye className="w-8 h-8" />,
    '🖱️': <MousePointer className="w-8 h-8" />,
};

const UndetectableFeatures: React.FC = () => {
    return (
        <section id="proof-section" className="py-20 lg:py-32 bg-[#161616]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Truly <span className="text-[#FACC15]">Invisible</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Built with 20+ advanced undetectability features to keep you invisible across every interview check.
                    </p>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {undetectableFeatures.map(feature => (
                        <div
                            key={feature.id}
                            className="group relative bg-[#1a1a1a] border border-white/5 rounded-2xl p-6 hover:border-[#FACC15]/30 transition-all duration-300"
                        >
                            {/* Glow Effect on Hover */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-[#FACC15]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            <div className="relative z-10">
                                {/* Icon */}
                                <div className="w-14 h-14 bg-[#FACC15]/10 rounded-xl flex items-center justify-center text-[#FACC15] mb-4 group-hover:bg-[#FACC15]/20 transition-colors">
                                    {iconMap[feature.icon] || <span className="text-2xl">{feature.icon}</span>}
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>

                                {/* Description */}
                                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default UndetectableFeatures;

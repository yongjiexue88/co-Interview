import React from 'react';
import { Check, X } from 'lucide-react';

interface Feature {
    name: string;
    coInterview: boolean;
    ultraCode: boolean;
    lockedIn: boolean;
    aiApply: boolean;
}

const comparisonFeatures: Feature[] = [
    { name: 'Supports Audio', coInterview: true, ultraCode: false, lockedIn: false, aiApply: false },
    { name: 'Invisible in Dock', coInterview: true, ultraCode: false, lockedIn: false, aiApply: false },
    { name: 'Invisible to Screen Share', coInterview: true, ultraCode: true, lockedIn: true, aiApply: false },
    { name: 'Invisible to Tray', coInterview: true, ultraCode: false, lockedIn: false, aiApply: false },
    { name: 'Invisible to Activity Monitor', coInterview: true, ultraCode: false, lockedIn: false, aiApply: false },
    { name: 'Click-through Overlay', coInterview: true, ultraCode: false, lockedIn: false, aiApply: false },
    { name: "Hasn't Been Caught", coInterview: true, ultraCode: false, lockedIn: false, aiApply: false },
    { name: 'Undetectable by Browser', coInterview: true, ultraCode: true, lockedIn: true, aiApply: false },
    { name: 'Real Video Proof', coInterview: true, ultraCode: false, lockedIn: false, aiApply: false },
];

const FeatureIcon = ({ supported }: { supported: boolean }) => (
    supported ? (
        <Check className="w-5 h-5 text-green-500" />
    ) : (
        <X className="w-5 h-5 text-red-500/70" />
    )
);

const CompetitorComparison: React.FC = () => {
    return (
        <section id="undetectability-comparison" className="py-20 lg:py-32 bg-[#0a0a0a]">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        The Proof Is in the <span className="text-[#FACC15]">Comparison</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        See how Co-Interview stacks up against the competition on every critical feature.
                    </p>
                </div>

                {/* Comparison Table */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-4 px-4 text-gray-400 font-medium text-sm">Feature</th>
                                <th className="text-center py-4 px-4 min-w-[120px]">
                                    <div className="flex flex-col items-center gap-1">
                                        <span className="text-[#FACC15] font-bold text-lg">Co-Interview</span>
                                        <span className="text-xs text-gray-500">The Original</span>
                                    </div>
                                </th>
                                <th className="text-center py-4 px-4 min-w-[100px]">
                                    <span className="text-gray-400 font-medium">UltraCode</span>
                                </th>
                                <th className="text-center py-4 px-4 min-w-[100px]">
                                    <span className="text-gray-400 font-medium">LockedIn</span>
                                </th>
                                <th className="text-center py-4 px-4 min-w-[100px]">
                                    <span className="text-gray-400 font-medium">AIApply</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {comparisonFeatures.map((feature, index) => (
                                <tr
                                    key={feature.name}
                                    className={`border-b border-white/5 ${index % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                                >
                                    <td className="py-4 px-4 text-white font-medium">{feature.name}</td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-center">
                                            <div className="w-8 h-8 bg-[#FACC15]/10 rounded-full flex items-center justify-center">
                                                <FeatureIcon supported={feature.coInterview} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-center">
                                            <FeatureIcon supported={feature.ultraCode} />
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-center">
                                            <FeatureIcon supported={feature.lockedIn} />
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-center">
                                            <FeatureIcon supported={feature.aiApply} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {/* Price Row */}
                            <tr className="border-b border-white/5">
                                <td className="py-4 px-4 text-white font-medium">Price</td>
                                <td className="py-4 px-4 text-center">
                                    <span className="text-[#FACC15] font-bold">$299/mo</span>
                                </td>
                                <td className="py-4 px-4 text-center text-gray-400">$399/mo</td>
                                <td className="py-4 px-4 text-center text-gray-400">$349/mo</td>
                                <td className="py-4 px-4 text-center text-gray-400">$199/mo</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Bottom Badge */}
                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-full px-6 py-3">
                        <Check className="w-5 h-5 text-[#FACC15]" />
                        <span className="text-[#FACC15] font-medium">Co-Interview: The only tool with 100% feature coverage</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default CompetitorComparison;

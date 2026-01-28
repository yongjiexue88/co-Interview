import React from 'react';
import { Check } from 'lucide-react';

const features = [
    'Invisible on screen recordings',
    'Hidden from OBS and screen share',
    'Undetectable by proctoring software',
    'Bypasses browser extensions checks',
    'Zero trace in system activity',
    'Works with all major platforms',
];

const UndetectableSection: React.FC = () => {
    return (
        <section className="bg-gray-50 py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl">
                    {/* Heading */}
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Undetectable</h2>
                    <p className="text-lg text-gray-600 mb-10">
                        Built from the ground up to be completely invisible. Our advanced stealth technology ensures you&apos;re never caught.
                    </p>

                    {/* Feature Checklist */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Check className="w-3 h-3 text-green-600" />
                                </div>
                                <span className="text-gray-700">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default UndetectableSection;

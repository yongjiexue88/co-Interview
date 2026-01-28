import React from 'react';
import { Monitor, MessageSquare, Zap, Layers, FileText, Send } from 'lucide-react';

const features = [
    {
        icon: Monitor,
        title: 'Screen capture',
        description: 'Automatically captures and analyzes your screen to understand the interview context.',
    },
    {
        icon: MessageSquare,
        title: 'Auto-suggest',
        description: 'Get real-time suggestions and hints as you work through coding problems.',
    },
    {
        icon: Zap,
        title: 'Fast responses',
        description: 'Lightning-fast AI responses so you never miss a beat during your interview.',
    },
    {
        icon: Layers,
        title: 'Multiple modes',
        description: 'Switch between different assistance modes based on your interview needs.',
    },
    {
        icon: FileText,
        title: 'Screen summary',
        description: 'Get instant summaries of complex problems to help you understand quickly.',
    },
    {
        icon: Send,
        title: 'Submit interview',
        description: 'Review and submit your solutions with confidence knowing they are verified.',
    },
];

const FeaturesGrid: React.FC = () => {
    return (
        <section className="bg-white py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Features</h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">Everything you need to ace your next coding interview</p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div key={index} className="p-6 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mb-4 shadow-sm">
                                    <Icon className="w-6 h-6 text-gray-700" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default FeaturesGrid;

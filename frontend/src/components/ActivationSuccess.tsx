import React, { useEffect } from 'react';
import Button from './ui/Button';
import { trackEvent } from '../lib/analytics';
import { Zap, PlayCircle, Check } from 'lucide-react';

const ActivationSuccess: React.FC = () => {
    useEffect(() => {
        trackEvent('activation_view');
    }, []);

    const handlePriorityClick = () => {
        trackEvent('priority_click');
        // In real app, this might open a payment modal or add a tag
        alert("You've been added to the priority list!");
    };

    return (
        <div className="w-full text-left animate-fadeIn">
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-green-500" />
                </div>
                <div>
                    <h3 className="text-white font-semibold">You're on the list!</h3>
                    <p className="text-xs text-gray-400">Your spot is reserved.</p>
                </div>
            </div>

            {/* Value Prop / Demo Placeholder */}
            <div className="bg-[#1a1a1a] border border-white/10 rounded-xl p-4 mb-4 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-200%] animate-shimmer"></div>

                <h4 className="text-sm font-medium text-white mb-2">Here's how we help you unfreeze:</h4>

                {/* Mock GIF/Video Area */}
                <div className="aspect-video bg-black rounded-lg border border-white/5 flex items-center justify-center relative mb-3 hover:border-[#FACC15]/30 transition-colors">
                    <PlayCircle className="w-8 h-8 text-gray-600" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        {/* Placeholder for actual GIF */}
                        <p className="text-[10px] text-gray-500 mt-12">15s Demo</p>
                    </div>
                </div>

                <p className="text-xs text-gray-400 leading-relaxed">
                    Interview Coder listens to your interview audio and instantly suggests the optimal algorithm when you get stuck.
                </p>
            </div>

            {/* The "Ask" / Activation */}
            <div className="space-y-3">
                <div className="bg-[#FACC15]/10 border border-[#FACC15]/20 rounded-lg p-3">
                    <p className="text-xs text-[#FACC15] mb-2 font-medium flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        Fast-track your access
                    </p>
                    <p className="text-[11px] text-gray-400 mb-3">Get early access + a 14-day free trial when we launch.</p>
                    <Button variant="primary" size="sm" className="w-full text-xs font-bold" onClick={handlePriorityClick}>
                        Add to Priority Access
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ActivationSuccess;

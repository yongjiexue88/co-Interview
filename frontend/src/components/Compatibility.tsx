import React from 'react';
import { compatiblePlatforms } from '../content/siteContent';

const Compatibility: React.FC = () => {
    return (
        <section className="py-20 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <div
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/30 mb-6"
                    >
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        Tested Daily
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Undetectable on <span className="text-[#FACC15]">Every</span> Interview App
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Daily testing, real-world checks, and constant monitoring ensure Co-Interview remains undetectable - 100% of the time
                    </p>
                </div>

                {/* Platform Icons Grid */}
                <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                    {compatiblePlatforms.map((platform) => (
                        <div
                            key={platform}
                            className="flex items-center justify-center px-6 py-3 bg-[#111] border border-white/5 rounded-full text-gray-300 text-sm font-medium hover:border-[#FACC15]/30 hover:text-white transition-all duration-300"
                        >
                            {platform}
                        </div>
                    ))}
                    <div className="flex items-center justify-center px-6 py-3 bg-[#FACC15]/10 border border-[#FACC15]/30 rounded-full text-[#FACC15] text-sm font-medium">
                        and all the interview softwares...
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Compatibility;

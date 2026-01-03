import React from 'react';

const Podium: React.FC = () => {
    return (
        <section id="podium" className="py-16 bg-[#0a0a0a] overflow-hidden">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Podium Graphic */}
                <div className="relative flex items-end justify-center gap-4 h-64">
                    {/* 2nd Place - Left */}
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#1a1a1a] border border-white/10 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-gray-500 text-xs font-medium text-center">Clone #1</span>
                        </div>
                        <div className="w-24 h-24 bg-gradient-to-b from-gray-700 to-gray-800 rounded-t-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-400">2</span>
                        </div>
                    </div>

                    {/* 1st Place - Center (Co-Interview) */}
                    <div className="flex flex-col items-center -mb-4">
                        <div className="w-28 h-28 bg-[#FACC15]/10 border-2 border-[#FACC15] rounded-xl flex flex-col items-center justify-center mb-2 shadow-lg shadow-[#FACC15]/20">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="#FACC15" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 17L12 22L22 17" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M2 12L12 17L22 12" stroke="#FACC15" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <span className="text-[#FACC15] text-xs font-bold mt-1">Co-Interview</span>
                        </div>
                        <div className="w-32 h-36 bg-gradient-to-b from-[#FACC15] to-yellow-600 rounded-t-lg flex items-center justify-center shadow-xl">
                            <span className="text-4xl font-bold text-black">1</span>
                        </div>
                    </div>

                    {/* 3rd Place - Right */}
                    <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-[#1a1a1a] border border-white/10 rounded-lg flex items-center justify-center mb-2">
                            <span className="text-gray-500 text-xs font-medium text-center">Clone #2</span>
                        </div>
                        <div className="w-24 h-16 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-lg flex items-center justify-center">
                            <span className="text-2xl font-bold text-amber-400">3</span>
                        </div>
                    </div>
                </div>

                {/* Caption */}
                <p className="text-center text-gray-500 mt-8 text-sm">The Original. Accept No Substitutes.</p>
            </div>
        </section>
    );
};

export default Podium;

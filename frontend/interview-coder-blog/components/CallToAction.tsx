import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const CallToAction: React.FC = () => {
  return (
    <section className="py-24 px-6 relative z-10 bg-dark-bg">
        <div className="max-w-[1200px] mx-auto text-center">
            {/* Logo */}
            <div className="flex justify-center mb-10">
                <div className="w-20 h-20 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(234,179,8,0.2)]">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="text-black transform -rotate-12">
                        <path d="M2 12C2 12 5 2 13 2C21 2 22 12 22 12C22 12 19 22 11 22C3 22 2 12 2 12Z" fillOpacity="0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 12C2 12 6 5 13 5C17 5 20 10 22 12" />
                        <path d="M2 12C2 12 6 19 13 19C17 19 20 14 22 12" />
                        <path d="M8 12H16" />
                    </svg>
                </div>
            </div>

            {/* Heading */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-[1.15] max-w-4xl mx-auto">
                Ready to Pass Any SWE Interviews with 100% Undetectable AI?
            </h2>
            
            {/* Subtext */}
            <p className="text-gray-400 text-lg mb-12">
                Start Your Free Trial Today
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-32">
                <button className="bg-brand-yellow hover:bg-[#FACC15] text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] min-w-[280px] justify-center">
                     <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mb-1">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.74 1.18 0 2.45-1.64 3.98-1.54 2.14.12 3.3.81 4.13 1.98-1.84 1.1-2.05 3.77-.1 5.37-1.14 2.37-2.38 4.09-3.09 6.42zM12.03 5.31c-.93 1.18-2.61 1.74-3.56 1.48.51-1.78 2.27-3.4 4.06-3.37.1.86.07 1.34-.5 1.89z" />
                     </svg>
                    Pass Your Next Interview
                </button>
                <button className="bg-brand-yellow hover:bg-[#FACC15] text-black px-8 py-4 rounded-full font-bold text-lg flex items-center gap-3 transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(250,204,21,0.4)] min-w-[280px] justify-center">
                    <svg viewBox="0 0 88 88" fill="currentColor" className="w-5 h-5">
                         <path d="M0 12.402l35.687-4.86.016 34.423-35.67.203zm35.67 33.529l.028 34.453L.028 75.48l-.028-34.668zm8.682-39.63L88 0v41.33H44.352zm0 39.826H88v41.28L44.352 81.65z"/>
                    </svg>
                    Pass Your Next Interview
                </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-[#1F2937] w-full mb-12" />

            {/* Back to Home */}
            <div className="flex justify-start">
                 <a href="#" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group font-medium text-sm">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Home
                 </a>
            </div>
        </div>
    </section>
  );
};
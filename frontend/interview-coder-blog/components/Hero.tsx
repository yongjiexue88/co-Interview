import React from 'react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Text */}
        <div className="flex-1 space-y-6 text-center md:text-left">
          <h1 className="text-6xl md:text-8xl font-bold text-gray-200 tracking-tight">
            Blog
          </h1>
          
          <p className="text-lg text-gray-400 max-w-lg leading-relaxed mx-auto md:mx-0">
            Learn more about Interview Coder, and how we can double your salary by using AI to one-shot your Leetcode assesments and interviews.
          </p>
        </div>

        {/* Right Visual */}
        <div className="flex-1 flex justify-center md:justify-end">
            <div className="relative w-64 h-64 md:w-80 md:h-80">
                {/* Simulated 3D Cube/Logo */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand-yellow/20 to-transparent rounded-3xl blur-3xl"></div>
                <img 
                    src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop" 
                    alt="Abstract 3D Shape" 
                    className="relative w-full h-full object-cover rounded-3xl shadow-2xl opacity-90 mask-image-gradient"
                    style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
                />
                 {/* Overlay Wing Icon to mimic the 3D logo in screenshot */}
                 <div className="absolute inset-0 flex items-center justify-center">
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor" className="text-brand-yellow drop-shadow-2xl opacity-90">
                        <path d="M2 12C2 12 5 2 13 2C21 2 22 12 22 12C22 12 19 22 11 22C3 22 2 12 2 12Z" fillOpacity="0.2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
                         <path d="M2 12Q6 4 14 4Q18 4 22 12" strokeWidth="1.5" />
                         <path d="M2 12Q6 16 14 16Q18 16 22 12" strokeWidth="1.5" />
                         <path d="M2 12H22" strokeWidth="1.5"/>
                         <path d="M6 8L18 8" strokeWidth="1"/>
                         <path d="M6 16L18 16" strokeWidth="1"/>
                    </svg>
                 </div>
            </div>
        </div>
      </div>
    </section>
  );
};
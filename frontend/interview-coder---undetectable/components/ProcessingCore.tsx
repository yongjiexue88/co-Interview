import React from 'react';

const ProcessingCore: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center w-64 h-64 md:w-96 md:h-96">
      {/* Outer Pulse Rings */}
      <div className="absolute inset-0 rounded-full border border-violet-500/20 animate-[spin_10s_linear_infinite]" />
      <div className="absolute inset-4 rounded-full border border-indigo-500/20 animate-[spin_12s_linear_infinite_reverse]" />
      <div className="absolute inset-12 rounded-full border border-fuchsia-500/20 animate-pulse" />

      {/* Glowing Orb Background */}
      <div className="absolute w-32 h-32 bg-violet-600/20 rounded-full blur-3xl animate-pulse" />

      {/* Central Tech Structure */}
      <div className="relative w-40 h-40 bg-black/80 backdrop-blur-sm rounded-full border border-white/10 flex items-center justify-center shadow-[0_0_50px_-12px_rgba(139,92,246,0.5)]">
        {/* Inner Rotating Ring */}
        <div className="absolute inset-2 rounded-full border-t-2 border-r-2 border-violet-500/50 rotate-45 animate-spin-slow" />
        
        {/* Core Nucleus */}
        <div className="w-16 h-16 bg-gradient-to-tr from-violet-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 animate-float">
          <div className="w-12 h-12 bg-black/20 rounded-full backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <div className="w-4 h-4 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse" />
          </div>
        </div>
      </div>
      
      {/* Decorative Particles */}
      <div className="absolute top-0 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
      <div className="absolute bottom-10 right-10 w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
      <div className="absolute top-10 left-10 w-1 h-1 bg-white/50 rounded-full" />
    </div>
  );
};

export default ProcessingCore;

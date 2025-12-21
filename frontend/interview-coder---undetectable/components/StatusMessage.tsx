import React, { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../constants';
import { Loader2 } from 'lucide-react';

const StatusMessage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 animate-fade-in-up">
      <div className="h-8 flex items-center justify-center">
        <span className="text-xl md:text-2xl font-mono font-medium text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-white to-violet-200 tracking-tight transition-all duration-500 text-center">
          {LOADING_MESSAGES[currentIndex]}
        </span>
      </div>
      
      <div className="flex items-center gap-2 text-sm text-gray-500 font-mono">
        <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
        <span>Estimated time: ~15s</span>
      </div>

      <div className="w-64 h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 animate-[loading_2s_ease-in-out_infinite] w-1/3 rounded-full" />
      </div>

       <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default StatusMessage;

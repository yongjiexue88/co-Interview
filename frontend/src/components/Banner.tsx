import React from 'react';

const Banner: React.FC = () => {
    return (
        <div className="w-full bg-gradient-to-b from-[#EFCC3A] to-[#E5A83A] text-black text-center py-2 text-sm font-semibold relative z-50">
            🚀 Find jobs smarter & faster with our official community{' '}
            <span className="inline-block px-2 py-0.5 bg-black/10 rounded ml-1 cursor-pointer hover:bg-black/20 transition-colors">
                r/Co-InterviewHQ
            </span>
        </div>
    );
};

export default Banner;

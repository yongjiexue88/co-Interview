import React from 'react';

const BlogSidebarCTA: React.FC = () => {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        const element = document.getElementById('download-cta');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-[#111] border border-white/10 rounded-2xl p-6 mb-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2 leading-snug">
                Download and try
                <br />
                Co-Interview for free
                <br />
                today
            </h3>
            <a
                href="#download-cta"
                onClick={handleClick}
                className="inline-block mt-4 bg-white text-black font-semibold px-6 py-2.5 rounded-full hover:bg-gray-200 transition-colors"
            >
                Get Started
            </a>
        </div>
    );
};

export default BlogSidebarCTA;

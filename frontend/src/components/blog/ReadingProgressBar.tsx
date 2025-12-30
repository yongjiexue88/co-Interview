import React, { useEffect, useState } from 'react';

interface ReadingProgressBarProps {
    /**
     * Optional ref to the article content element to track.
     * If not provided, tracks the entire document.
     */
    articleRef?: React.RefObject<HTMLElement>;
}

const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({ articleRef }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            let scrollProgress = 0;

            if (articleRef?.current) {
                // Track progress based on article element
                const articleTop = articleRef.current.offsetTop;
                const articleHeight = articleRef.current.offsetHeight;
                const scrollTop = window.scrollY;
                const windowHeight = window.innerHeight;

                // Start measuring from when article comes into view
                const startPoint = articleTop;
                const endPoint = articleTop + articleHeight - windowHeight;

                if (scrollTop <= startPoint) {
                    scrollProgress = 0;
                } else if (scrollTop >= endPoint) {
                    scrollProgress = 100;
                } else {
                    scrollProgress = ((scrollTop - startPoint) / (endPoint - startPoint)) * 100;
                }
            } else {
                // Track entire document
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                scrollProgress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            }

            setProgress(Math.min(100, Math.max(0, scrollProgress)));
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial calculation

        return () => window.removeEventListener('scroll', handleScroll);
    }, [articleRef]);

    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Reading Progress</span>
                <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-teal-500 to-teal-400 rounded-full transition-all duration-150 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default ReadingProgressBar;

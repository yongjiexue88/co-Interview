import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

export const useScrollTracking = () => {
    const location = useLocation();
    const maxScroll = useRef(0);
    const milestones = useRef(new Set<number>());

    useEffect(() => {
        // Reset specific milestones on route change
        maxScroll.current = 0;
        milestones.current.clear();

        let throttleTimeout: NodeJS.Timeout | null = null;

        const handleScroll = () => {
            if (throttleTimeout) return;

            throttleTimeout = setTimeout(() => {
                const scrollTop = window.scrollY;
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = Math.min(100, Math.round((scrollTop / docHeight) * 100));

                if (scrollPercent > maxScroll.current) {
                    maxScroll.current = scrollPercent;
                }

                [25, 50, 75, 90, 100].forEach(milestone => {
                    if (scrollPercent >= milestone && !milestones.current.has(milestone)) {
                        milestones.current.add(milestone);
                        trackEvent('scroll_depth', {
                            percentage: milestone,
                            path: location.pathname,
                        });
                    }
                });

                throttleTimeout = null;
            }, 500); // Check every 500ms
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [location.pathname]);
};

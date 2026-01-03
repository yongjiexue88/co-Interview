import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

export const useExitTracking = () => {
    const location = useLocation();
    const [startTime, setStartTime] = useState(() => Date.now());
    const pathRef = useRef(location.pathname);

    // Update path ref on location change
    useEffect(() => {
        pathRef.current = location.pathname;
        setStartTime(Date.now());
    }, [location]);

    useEffect(() => {
        const handleExit = () => {
            const duration = Math.round((Date.now() - startTime) / 1000);
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight;
            const scrollPercent = Math.min(100, Math.round((scrollTop / (docHeight - window.innerHeight)) * 100));

            // Only log significant interactions (> 2 seconds)
            if (duration > 2) {
                // We use sendBeacon for reliability on page unload if possible,
                // but our trackEvent handles fire-and-forget logic for Firestore.
                trackEvent('page_leave', {
                    path: pathRef.current,
                    duration_seconds: duration,
                    scroll_exit_percent: scrollPercent,
                });
            }
        };

        // Trigger on tab hide (most reliable mobile/modern way)
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                handleExit();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Also stick to 'beforeunload' for older desktop behavior
        window.addEventListener('beforeunload', handleExit);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('beforeunload', handleExit);
        };
    }, [startTime]);
};

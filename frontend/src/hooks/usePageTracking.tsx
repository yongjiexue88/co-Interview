import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEvent } from '../lib/analytics';

export const usePageTracking = () => {
    const location = useLocation();

    useEffect(() => {
        // Track page view on route change
        trackEvent('page_view', {
            page_path: location.pathname + location.search,
            page_title: document.title,
            page_location: window.location.href,
        });
    }, [location]);
};

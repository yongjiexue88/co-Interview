import { useState, useEffect, useRef } from 'react';
import { trackEvent } from '../lib/analytics';

export const useExperiment = <T extends string>(experimentId: string, variants: T[]): T => {
    // Default to first variant initially to avoid hydration mismatch if we were doing SSR
    // (though this is a SPA, it keeps things stable).
    const [variant, setVariant] = useState<T>(variants[0]);
    const hasLoggedImpression = useRef(false);

    useEffect(() => {
        // 1. Check if user already has a variant assignments
        const storageKey = `experiment_${experimentId}`;
        const storedVariant = localStorage.getItem(storageKey) as T | null;

        let selectedVariant = storedVariant;

        if (!selectedVariant || !variants.includes(selectedVariant)) {
            // 2. Assign new variant
            const randomIndex = Math.floor(Math.random() * variants.length);
            selectedVariant = variants[randomIndex];
            localStorage.setItem(storageKey, selectedVariant);
        }

        setVariant(selectedVariant);

        // 3. Log impression (only once per session/mount)
        if (!hasLoggedImpression.current) {
            trackEvent('experiment_impression', {
                experiment_id: experimentId,
                variant_id: selectedVariant,
            });
            hasLoggedImpression.current = true;

            // Helpful for debugging
            if (import.meta.env.DEV) {
                console.log(`[Experiment] ${experimentId}: Assigned ${selectedVariant}`);
            }
        }
    }, [experimentId, variants]);

    return variant;
};

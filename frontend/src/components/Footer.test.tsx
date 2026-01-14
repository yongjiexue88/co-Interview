import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from './Footer';
import { MemoryRouter } from 'react-router-dom';

// Mock siteContent
vi.mock('../content/siteContent', () => ({
    footerLinks: {
        legal: [{ name: 'Privacy', href: '/privacy' }],
        pages: [
            { name: 'Home', href: '/' },
            { name: 'External Resource', href: 'https://example.com/resource' },
        ],
        compare: [{ name: 'Vs Others', href: '/vs' }],
    },
}));

// Mock analytics
const mockTrackEvent = vi.fn();
vi.mock('../lib/analytics', () => ({
    trackEvent: mockTrackEvent,
}));

describe('Footer', () => {
    // ... existing renders tests

    it('renders external links correctly', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );
        const externalLink = screen.getByText('External Resource');
        expect(externalLink.tagName).toBe('A');
        expect(externalLink).toHaveAttribute('href', 'https://example.com/resource');
        expect(externalLink).toHaveAttribute('target', '_blank');
    });

    // ... rest of tests
});

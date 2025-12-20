import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from './HomePage';
import { MemoryRouter } from 'react-router-dom';

// Mock child components to isolate HomePage structure testing
vi.mock('../components/SimpleNavbar', () => ({
    default: () => <div data-testid="navbar">Navbar</div>,
}));
vi.mock('../components/SimpleHero', () => ({
    default: () => <div data-testid="hero">Hero</div>,
}));
vi.mock('../components/SocialProof', () => ({
    default: () => <div data-testid="social-proof">SocialProof</div>,
}));
vi.mock('../components/UndetectableSection', () => ({
    default: () => <div data-testid="undetectable">Undetectable</div>,
}));
vi.mock('../components/FeaturesGrid', () => ({
    default: () => <div data-testid="features">Features</div>,
}));
vi.mock('../components/SimpleFAQ', () => ({
    default: () => <div data-testid="faq">FAQ</div>,
}));
vi.mock('../components/FinalCTASection', () => ({
    default: () => <div data-testid="final-cta">FinalCTA</div>,
}));
vi.mock('../components/SimpleFooter', () => ({
    default: () => <div data-testid="footer">Footer</div>,
}));
vi.mock('../components/SEO', () => ({ default: () => null }));

describe('HomePage', () => {
    it('renders all main sections', () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('hero')).toBeInTheDocument();
        expect(screen.getByTestId('social-proof')).toBeInTheDocument();
        expect(screen.getByTestId('undetectable')).toBeInTheDocument();
        expect(screen.getByTestId('features')).toBeInTheDocument();
        expect(screen.getByTestId('faq')).toBeInTheDocument();
        expect(screen.getByTestId('final-cta')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
});

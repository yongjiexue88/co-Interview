import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from './HomePage';
import { MemoryRouter } from 'react-router-dom';

// Mock child components to isolate HomePage structure testing
vi.mock('../components/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('../components/Hero', () => ({ default: () => <div data-testid="hero">Hero</div> }));
vi.mock('../components/PricingSection', () => ({ default: () => <div data-testid="pricing">Pricing</div> }));
vi.mock('../components/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));
// Mock other components as needed, simple divs are enough for smoke tests
vi.mock('../components/UndetectableFeatures', () => ({ default: () => <div>Features</div> }));
vi.mock('../components/CompetitorComparison', () => ({ default: () => <div>Comparison</div> }));
vi.mock('../components/Testimonials', () => ({ default: () => <div>Testimonials</div> }));
vi.mock('../components/Compatibility', () => ({ default: () => <div>Compatibility</div> }));
vi.mock('../components/FAQ', () => ({ default: () => <div>FAQ</div> }));
vi.mock('../components/Podium', () => ({ default: () => <div>Podium</div> }));
vi.mock('../components/FinalCTA', () => ({ default: () => <div>FinalCTA</div> }));
vi.mock('../components/Banner', () => ({ default: () => <div>Banner</div> }));
vi.mock('../components/SEO', () => ({ default: () => null })); // SEO doesn't render visible UI usually

describe('HomePage', () => {
    it('renders all main sections', () => {
        render(
            <MemoryRouter>
                <HomePage />
            </MemoryRouter>
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('hero')).toBeInTheDocument();
        expect(screen.getByTestId('pricing')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
});

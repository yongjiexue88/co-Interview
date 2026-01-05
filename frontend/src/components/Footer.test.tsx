import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Footer from './Footer';
import { MemoryRouter } from 'react-router-dom';

// Mock siteContent
vi.mock('../content/siteContent', () => ({
    footerLinks: {
        legal: [{ name: 'Privacy', href: '/privacy' }],
        pages: [{ name: 'Home', href: '/' }],
        compare: [{ name: 'Vs Others', href: '/vs' }],
    },
}));

describe('Footer', () => {
    it('renders brand information', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        const brandNames = screen.getAllByText('Co-Interview');
        expect(brandNames.length).toBeGreaterThan(0);
        expect(screen.getByText(/Co-Interview is a desktop app/i)).toBeInTheDocument();
    });

    it('renders social icons', () => {
        const { container } = render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        const twitterLink = container.querySelector('a[href="https://x.com/InterviewCoder"]');
        const instagramLink = container.querySelector('a[href="https://www.instagram.com/interviewcoder/"]');
        const youtubeLink = container.querySelector('a[href="https://www.youtube.com/@InterviewCoder-official"]');

        expect(twitterLink).toBeInTheDocument();
        expect(instagramLink).toBeInTheDocument();
        expect(youtubeLink).toBeInTheDocument();
    });

    it('renders navigation links from siteContent', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        expect(screen.getByText('Legal')).toBeInTheDocument();
        expect(screen.getByText('Privacy')).toBeInTheDocument();
        expect(screen.getByText('Pages')).toBeInTheDocument();
        expect(screen.getByText('Home')).toBeInTheDocument();
        expect(screen.getByText('Compare')).toBeInTheDocument();
        expect(screen.getByText('Vs Others')).toBeInTheDocument();
    });

    it('renders affiliate link', () => {
        render(
            <MemoryRouter>
                <Footer />
            </MemoryRouter>
        );

        expect(screen.getByText('Become an Affiliate')).toBeInTheDocument();
    });
});

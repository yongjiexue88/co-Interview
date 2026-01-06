import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PolicyDetailLayout from './PolicyDetailLayout';
import { MemoryRouter } from 'react-router-dom';

// Mock child components
vi.mock('./Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('./Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));
vi.mock('./Banner', () => ({ default: () => <div data-testid="banner">Banner</div> }));
vi.mock('./SEO', () => ({ default: ({ title }: any) => <div data-testid="seo">{title}</div> }));

describe('PolicyDetailLayout', () => {
    it('renders layout components and children', () => {
        render(
            <MemoryRouter>
                <PolicyDetailLayout title="Test Policy" description="Test Description">
                    <p>Policy Content</p>
                </PolicyDetailLayout>
            </MemoryRouter>
        );

        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
        expect(screen.getByTestId('banner')).toBeInTheDocument();
        expect(screen.getByTestId('seo')).toHaveTextContent('Test Policy — Co-Interview');

        expect(screen.getByText('Test Policy')).toBeInTheDocument();
        expect(screen.getByText('Policy Content')).toBeInTheDocument();
    });

    it('renders back link', () => {
        render(
            <MemoryRouter>
                <PolicyDetailLayout title="Test Policy" description="Test Description">
                    <p>Content</p>
                </PolicyDetailLayout>
            </MemoryRouter>
        );

        const backLink = screen.getByRole('link', { name: /back to policies/i });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute('href', '/policies');
    });

    it('applies custom validation class if provided', () => {
        // The component accepts maxWidth
        render(
            <MemoryRouter>
                <PolicyDetailLayout title="Test" description="Desc" maxWidth="max-w-xl">
                    <p>Content</p>
                </PolicyDetailLayout>
            </MemoryRouter>
        );

        // We can't easily check class on the div wrapping children without a testid on that div.
        // But we can check if the rendered text is inside a div with that class
        // screen.getByText('Content').closest('div') might not be it if prose is used.
        // Let's rely on the defaults and general structure rendering.
        // Actually, line 24: <div className={`${maxWidth} mx-auto`}>
        // Since we don't have a test-id, we can try to find by text and traverse up.

        const content = screen.getByText('Content');
        const proseDiv = content.parentElement; // div.prose
        const containerDiv = proseDiv?.parentElement; // div.${maxWidth}

        expect(containerDiv).toHaveClass('max-w-xl');
    });
});

import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BlogPostPage from './BlogPostPage';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Mock the blog loader
vi.mock('../content/blogLoader', () => ({
    getBlogPostBySlug: vi.fn().mockResolvedValue({
        id: 'test-post',
        slug: 'test-post',
        title: 'Test Blog Post Title',
        date: 'December 30, 2025',
        href: '/blog/test-post',
        readTime: '5 min',
        content: `
            <h2 id="heading-0-summary">Summary</h2>
            <p>This is a test paragraph.</p>
            <h3 id="heading-1-details">Details</h3>
            <p>More test content here.</p>
            <h2 id="heading-2-conclusion">Conclusion</h2>
            <p>Final paragraph.</p>
        `,
        headings: [
            { id: 'heading-0-summary', text: 'Summary', level: 2 },
            { id: 'heading-1-details', text: 'Details', level: 3 },
            { id: 'heading-2-conclusion', text: 'Conclusion', level: 2 },
        ],
        description: 'Test blog post description...',
    }),
}));

// Mock child components for isolation
vi.mock('../components/Banner', () => ({ default: () => <div data-testid="banner">Banner</div> }));
vi.mock('../components/Navbar', () => ({ default: () => <div data-testid="navbar">Navbar</div> }));
vi.mock('../components/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));
vi.mock('../components/SEO', () => ({ default: () => null }));

// Keep the blog components unmocked to test their integration
// vi.mock('../components/blog/ReadingProgressBar', ...);
// vi.mock('../components/blog/BlogTableOfContents', ...);

const renderWithRouter = (slug: string = 'test-post') => {
    return render(
        <MemoryRouter initialEntries={[`/blog/${slug}`]}>
            <Routes>
                <Route path="/blog/:slug" element={<BlogPostPage />} />
            </Routes>
        </MemoryRouter>
    );
};

describe('BlogPostPage', () => {
    it('renders main layout components', async () => {
        renderWithRouter();

        // Wait for blog post to load (confirmed by title appearing)
        await screen.findByText('Test Blog Post Title');

        // Now check layout components
        expect(screen.getByTestId('navbar')).toBeInTheDocument();
        expect(screen.getByTestId('banner')).toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders blog post title', async () => {
        renderWithRouter();

        expect(await screen.findByText('Test Blog Post Title')).toBeInTheDocument();
    });

    it('renders blog post date', async () => {
        renderWithRouter();

        expect(await screen.findByText('December 30, 2025')).toBeInTheDocument();
    });

    it('renders reading progress section', async () => {
        renderWithRouter();

        // Wait for content to load
        await screen.findByText('Test Blog Post Title');

        // Check for reading progress bar
        expect(screen.getByText('Reading Progress')).toBeInTheDocument();
    });

    it('renders table of contents with headings', async () => {
        renderWithRouter();

        // Wait for content to load
        await screen.findByText('Test Blog Post Title');

        // Check for TOC header
        expect(screen.getByText('On This Page')).toBeInTheDocument();

        // Check for headings - they appear in both article content and TOC
        // so we use getAllByText to verify they're present
        expect(screen.getAllByText('Summary').length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText('Details').length).toBeGreaterThanOrEqual(2);
        expect(screen.getAllByText('Conclusion').length).toBeGreaterThanOrEqual(2);
    });

    it('renders back link to blog', async () => {
        renderWithRouter();

        await screen.findByText('Test Blog Post Title');

        const backLink = screen.getByRole('link', { name: /back/i });
        expect(backLink).toBeInTheDocument();
        expect(backLink).toHaveAttribute('href', '/blog');
    });

    it('renders download CTA section', async () => {
        renderWithRouter();

        await screen.findByText('Test Blog Post Title');

        expect(screen.getByText(/Download and try/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Get Started' })).toBeInTheDocument();
    });
});

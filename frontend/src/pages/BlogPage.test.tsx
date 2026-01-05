import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BlogPage from './BlogPage';
import { MemoryRouter } from 'react-router-dom';
import { loadAllBlogPosts } from '../content/blogLoader';

// Mock blog loader
vi.mock('../content/blogLoader', () => ({
    loadAllBlogPosts: vi.fn(),
}));

// Mock components
vi.mock('../components/SEO', () => ({
    default: () => <div data-testid="seo" />,
}));
vi.mock('../components/Banner', () => ({
    default: () => <div data-testid="banner" />,
}));
vi.mock('../components/Navbar', () => ({
    default: () => <div data-testid="navbar" />,
}));
vi.mock('../components/Footer', () => ({
    default: () => <div data-testid="footer" />,
}));
vi.mock('../components/blog/BlogHero', () => ({
    default: ({ featuredPost }: any) => <div data-testid="blog-hero">{featuredPost.title}</div>,
}));
vi.mock('../components/blog/BlogList', () => ({
    default: ({ groups }: any) => (
        <div data-testid="blog-list">
            {groups.map((g: any) => (
                <div key={g.month}>{g.month}</div>
            ))}
        </div>
    ),
}));

describe('BlogPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state then blog content', async () => {
        const mockPosts = [
            {
                id: '1',
                title: 'Post 1',
                date: '2024-01-15',
                href: '/blog/post-1',
                imageUrl: '',
                author: 'Test',
                description: 'Test post',
                content: 'Content',
                authorImage: '',
                tags: [],
            },
            {
                id: '2',
                title: 'Post 2',
                date: '2023-12-15',
                href: '/blog/post-2',
                imageUrl: '',
                author: 'Test',
                description: 'Test post',
                content: 'Content',
                authorImage: '',
                tags: [],
            },
        ];
        (loadAllBlogPosts as any).mockResolvedValue(mockPosts);

        render(
            <MemoryRouter>
                <BlogPage />
            </MemoryRouter>
        );

        // Should show loading spinner initially
        expect(document.querySelector('.animate-spin')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId('blog-hero')).toHaveTextContent('Post 1');
            expect(screen.getByText('January 2024')).toBeInTheDocument();
            expect(screen.getByText('December 2023')).toBeInTheDocument();
        });
    });

    it('handles error loading posts', async () => {
        (loadAllBlogPosts as any).mockRejectedValue(new Error('Failed to load'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        render(
            <MemoryRouter>
                <BlogPage />
            </MemoryRouter>
        );

        await waitFor(() => {
            expect(screen.queryByTestId('blog-hero')).not.toBeInTheDocument();
        });

        expect(consoleSpy).toHaveBeenCalledWith('Failed to load blog posts', expect.any(Error));
        consoleSpy.mockRestore();
    });
});

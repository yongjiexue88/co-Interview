import { BlogPost } from './blogTypes';

// Heading structure for table of contents
export interface Heading {
    id: string;
    text: string;
    level: 2 | 3;
}

// We'll use a specific interface for the parsed content
export interface ParsedBlogPost extends BlogPost {
    content: string; // HTML content of the article
    slug: string;
    readTime: string;
    headings: Heading[];
    imageUrl: string;
    description?: string;
}

// Helper to calculate read time
const calculateReadTime = (text: string): string => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min`;
};

// Helper to generate slug from heading text
const generateSlug = (text: string): string => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};

// Extract headings from article for table of contents
const extractHeadings = (article: Element | null): Heading[] => {
    if (!article) return [];

    const headings: Heading[] = [];
    const headingElements = article.querySelectorAll('h2, h3');

    headingElements.forEach((el, index) => {
        const text = el.textContent?.trim() || '';
        if (text) {
            const id = `heading-${index}-${generateSlug(text)}`;
            headings.push({
                id,
                text,
                level: el.tagName === 'H2' ? 2 : 3,
            });
        }
    });

    return headings;
};

// Map to store parsed posts to avoid re-parsing
let cachedPosts: ParsedBlogPost[] | null = null;

export const loadAllBlogPosts = async (): Promise<ParsedBlogPost[]> => {
    if (cachedPosts) return cachedPosts;

    // eager: false (default) would require awaiting each import.
    // eager: true loads them all as strings immediately.
    // We use query: '?raw' to get the content string.
    const modules = import.meta.glob('./blog-html/*.html', {
        query: '?raw',
        import: 'default',
        eager: true,
    });

    const posts: ParsedBlogPost[] = [];

    for (const path in modules) {
        const htmlContent = modules[path] as string;
        const filename = path.split('/').pop()?.replace('.html', '') || '';

        // Parse the HTML string
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        // Extract Title
        const title = doc.querySelector('h1')?.textContent?.trim() || 'Untitled Post';

        // Extract Date
        // Looking for the date div provided in sample: <div class="mb-6 flex items-center gap-2 text-sm text-gray-300"><span>August 23, 2025</span></div>
        // We can look for the span inside that specific structure or just a likely date candidate
        const dateElement = doc.querySelector('header .text-gray-300 span');
        const date = dateElement?.textContent?.trim() || new Date().toLocaleDateString();

        // Extract Content
        // content is in <article class="prose ...">
        const article = doc.querySelector('article');

        // Extract headings for table of contents
        const headings = extractHeadings(article);

        // Inject IDs into heading elements for anchor navigation
        if (article) {
            const headingElements = article.querySelectorAll('h2, h3');
            headingElements.forEach((el, index) => {
                const text = el.textContent?.trim() || '';
                if (text) {
                    el.id = `heading-${index}-${generateSlug(text)}`;
                }
            });
        }

        const content = article ? article.innerHTML : '';

        // Calculate read time from text content
        const textContent = article ? article.textContent || '' : '';
        const readTime = calculateReadTime(textContent);

        // Slug is the filename
        const slug = filename;

        // Use a placeholder image or try to find one in the content
        // The sample HTML has <span data-media="image">[IMAGE 800x600]</span> which acts as placeholders.
        // We might want to replace those or provide a default hero image.
        // For now, let's use a default gradient or random image if not found.
        const imageUrl = 'https://cdn.sanity.io/images/bpbg4yh8/production/b386f6de61cdb286916e0037f3e7aa8c502abe1e-2400x1600.jpg'; // Default from blogData

        posts.push({
            id: slug,
            slug,
            title,
            date,
            href: `/blog/${slug}`,
            readTime,
            content,
            headings,
            imageUrl,
            description: textContent.slice(0, 150) + '...', // Create excerpt
        });
    }

    // Sort by date (descending)
    posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    cachedPosts = posts;
    return posts;
};

export const getBlogPostBySlug = async (slug: string): Promise<ParsedBlogPost | null> => {
    const posts = await loadAllBlogPosts();
    return posts.find(p => p.slug === slug) || null;
};

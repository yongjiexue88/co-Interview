import React, { useEffect, useState } from 'react';
import SEO from '../components/SEO';
import Banner from '../components/Banner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlogHero from '../components/blog/BlogHero';
import BlogList from '../components/blog/BlogList';
import { loadAllBlogPosts, ParsedBlogPost } from '../content/blogLoader';
import { MonthGroup, FeaturedPost } from '../content/blogTypes';

const BlogPage: React.FC = () => {
    const [groups, setGroups] = useState<MonthGroup[]>([]);
    const [featuredPost, setFeaturedPost] = useState<FeaturedPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPosts = async () => {
            try {
                const posts = await loadAllBlogPosts();

                // Group posts by Month Year
                const groupsMap: { [key: string]: ParsedBlogPost[] } = {};

                posts.forEach(post => {
                    // Try to parse the date. If failed, default to 'Recent' or similar?
                    // The loader provides a formatted date string usually, but let's try to parse it for sorting/grouping
                    const dateObj = new Date(post.date);
                    // If invalid date, maybe put at end?
                    const key = isNaN(dateObj.getTime()) ? 'Recent Posts' : dateObj.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

                    if (!groupsMap[key]) {
                        groupsMap[key] = [];
                    }
                    groupsMap[key].push(post);
                });

                // Sort keys (months) descending
                const sortedKeys = Object.keys(groupsMap).sort((a, b) => {
                    if (a === 'Recent Posts') return -1;
                    if (b === 'Recent Posts') return 1;
                    return new Date(b).getTime() - new Date(a).getTime();
                });

                const blogGroups: MonthGroup[] = sortedKeys.map(key => ({
                    month: key,
                    posts: groupsMap[key],
                }));

                setGroups(blogGroups);

                // Set Featured Post (e.g. the very first one)
                if (posts.length > 0) {
                    const first = posts[0];
                    setFeaturedPost({
                        id: first.id,
                        title: first.title,
                        date: first.date,
                        href: first.href,
                        imageUrl: first.imageUrl,
                    });
                }
            } catch (error) {
                console.error('Failed to load blog posts', error);
            } finally {
                setLoading(false);
            }
        };

        loadPosts();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#000000] text-white">
                <Banner />
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-12 h-12 border-4 border-[#EFCC3A] border-t-transparent rounded-full animate-spin"></div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-[#EFCC3A]/30">
            <SEO
                title="Blog — Co-Interview"
                description="Tips, strategies, and insights for acing your technical interviews with AI-powered assistance."
                canonicalUrl="https://co-interview.com/blog"
                keywords={['technical interview blog', 'coding interview tips', 'software engineer interview guide', 'interview preparation strategies']}
            />
            <Banner />
            <Navbar />
            <main className="pt-6">
                {featuredPost && <BlogHero featuredPost={featuredPost} />}
                <BlogList groups={groups} featuredPost={featuredPost || undefined} />
            </main>
            <Footer />
        </div>
    );
};

export default BlogPage;

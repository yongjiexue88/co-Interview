import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPostBySlug, ParsedBlogPost } from '../content/blogLoader';
import SEO from '../components/SEO';
import Banner from '../components/Banner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReadingProgressBar from '../components/blog/ReadingProgressBar';
import BlogTableOfContents from '../components/blog/BlogTableOfContents';
import { ArrowLeft } from 'lucide-react';

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<ParsedBlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const articleRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) {
                setError('Post not found');
                setLoading(false);
                return;
            }

            try {
                const data = await getBlogPostBySlug(slug);
                if (data) {
                    setPost(data);
                } else {
                    setError('Post not found');
                }
            } catch (err) {
                console.error('Error fetching blog post:', err);
                setError('Failed to load post');
            } finally {
                setLoading(false);
            }
        };

        fetchPost();
    }, [slug]);

    const handleShare = async () => {
        if (navigator.share && post) {
            try {
                await navigator.share({
                    title: post.title,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled or error
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#000000] text-white">
                <Banner />
                <Navbar />
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="animate-pulse flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-[#EFCC3A] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-gray-400">Loading article...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !post) {
        return (
            <div className="min-h-screen bg-[#000000] text-white">
                <SEO title="Post Not Found — Co-Interview" />
                <Banner />
                <Navbar />
                <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
                    <h1 className="text-4xl font-bold mb-4">404</h1>
                    <p className="text-gray-400 mb-8">This blog post doesn't exist or has been moved.</p>
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#EFCC3A] text-black font-semibold rounded-lg hover:bg-[#d4b534] transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-[#EFCC3A]/30">
            <SEO
                title={`${post.title} — Co-Interview Blog`}
                description={post.description || post.title}
            />
            <Banner />
            <Navbar />

            <main className="pt-8 pb-24 px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Back Link */}
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back
                    </Link>

                    {/* Title */}
                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 max-w-4xl">
                        {post.title}
                    </h1>

                    {/* Date */}
                    <div className="text-gray-400 text-sm mb-12">
                        {post.date}
                    </div>

                    {/* Main Content Layout */}
                    <div className="flex gap-12">
                        {/* Article Content - Left Side */}
                        <div className="flex-1 min-w-0 max-w-4xl">
                            <article
                                ref={articleRef}
                                className="prose prose-lg prose-invert max-w-none
                                    prose-headings:text-white prose-headings:font-bold prose-headings:scroll-mt-24
                                    prose-p:text-gray-300 prose-p:leading-relaxed
                                    prose-a:text-white prose-a:underline prose-a:decoration-gray-500 hover:prose-a:decoration-white
                                    prose-strong:text-white
                                    prose-code:text-[#EFCC3A] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                                    prose-pre:bg-[#111] prose-pre:border prose-pre:border-white/10
                                    prose-blockquote:border-l-[#EFCC3A] prose-blockquote:text-gray-400
                                    prose-li:text-gray-300
                                    marker:text-gray-500"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            {/* Download CTA */}
                            <div className="mt-20 p-8 md:p-12 bg-[#111] rounded-3xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-8">
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-bold mb-4">
                                        Download and try <br />
                                        <span className="text-white">InterviewCoder for free today</span>
                                    </h3>
                                </div>
                                <a
                                    href="/#download"
                                    className="w-full md:w-auto px-8 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
                                >
                                    Get Started
                                </a>
                            </div>
                        </div>

                        {/* Sidebar - Right Side (hidden on mobile) */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24">
                                {/* Reading Progress */}
                                <ReadingProgressBar articleRef={articleRef} />

                                {/* Table of Contents */}
                                {post.headings && post.headings.length > 0 && (
                                    <BlogTableOfContents headings={post.headings} />
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPostPage;

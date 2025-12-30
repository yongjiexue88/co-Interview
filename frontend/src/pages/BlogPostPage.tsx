import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getBlogPostBySlug, ParsedBlogPost } from '../content/blogLoader';
import SEO from '../components/SEO';
import Banner from '../components/Banner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ReadingProgressBar from '../components/blog/ReadingProgressBar';
import BlogTableOfContents from '../components/blog/BlogTableOfContents';
import BlogSidebarCTA from '../components/blog/BlogSidebarCTA';
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
                        </div>

                        {/* Sidebar - Right Side (hidden on mobile) */}
                        <aside className="hidden lg:block w-64 flex-shrink-0">
                            <div className="sticky top-24">
                                <BlogSidebarCTA />
                                {/* Reading Progress */}
                                <ReadingProgressBar articleRef={articleRef} />

                                {/* Table of Contents */}
                                {post.headings && post.headings.length > 0 && (
                                    <BlogTableOfContents headings={post.headings} />
                                )}
                            </div>
                        </aside>
                    </div>

                    {/* Full-width Download CTA Section */}
                    <section id="download-cta" className="mt-24 py-16 text-center">
                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 md:w-20 md:h-20 mb-8 rounded-2xl bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] flex items-center justify-center shadow-lg shadow-[#EFCC3A]/20">
                            <svg className="w-8 h-8 md:w-10 md:h-10 text-black" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                        </div>

                        {/* Headline */}
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 leading-tight text-white">
                            Ready to Pass Any SWE Interviews<br className="hidden sm:block" /> with 100% Undetectable AI?
                        </h2>

                        {/* Subtext */}
                        <p className="text-base md:text-lg mb-10 text-gray-400">
                            Start Your Free Trial Today
                        </p>

                        {/* Download Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 max-w-lg mx-auto">
                            <a
                                href="/#download"
                                className="group relative flex items-center justify-center gap-3 px-6 py-4 rounded-full text-base md:text-lg font-semibold w-full sm:w-auto overflow-hidden transition-all duration-300 hover:scale-105 bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] text-black shadow-lg shadow-[#EFCC3A]/30"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                </svg>
                                Pass Your Next Interview
                            </a>
                            <a
                                href="/#download"
                                className="group relative flex items-center justify-center gap-3 px-6 py-4 rounded-full text-base md:text-lg font-semibold w-full sm:w-auto overflow-hidden transition-all duration-300 hover:scale-105 bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] text-black shadow-lg shadow-[#EFCC3A]/30"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M3 12V6.75l9-5.25 9 5.25V12h-2.73l.13.35c.09.27.13.54.13.81v4.34A3.5 3.5 0 0116 21H8a3.5 3.5 0 01-3.53-3.5v-4.34c0-.27.04-.54.13-.81l.13-.35H3zm9-8.17L5 7.75v2.25h14V7.75l-7-4.17zM7 14.16v3.34A1.5 1.5 0 008.5 19h7a1.5 1.5 0 001.5-1.5v-3.34c0-.11-.02-.23-.05-.34l-.45-1.32H7.5l-.45 1.32c-.03.11-.05.23-.05.34z" />
                                </svg>
                                Pass Your Next Interview
                            </a>
                        </div>
                    </section>

                    {/* Back to Blog Button */}
                    <div className="flex justify-center mt-12 mb-8 border-t border-white/10 pt-12">
                        <Link
                            to="/blog"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-black border border-white/20 hover:bg-white/10 hover:border-white/40 text-white font-semibold rounded-lg transition-all duration-300 group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back to Blog
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPostPage;

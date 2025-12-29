import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import SEO from '../components/SEO';
import Banner from '../components/Banner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';

interface BlogPostData {
    slug: string;
    title: string;
    content: string; // HTML or Markdown
    date: string;
    imageUrl: string;
    readTime: string;
    description?: string;
    author?: string;
}

const BlogPostPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPost = async () => {
            if (!slug) {
                setError('Post not found');
                setLoading(false);
                return;
            }

            try {
                // Query by slug field
                const postsRef = collection(db, 'blog_posts');
                const q = query(postsRef, where('slug', '==', slug));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    setError('Post not found');
                    setLoading(false);
                    return;
                }

                const docData = querySnapshot.docs[0].data() as BlogPostData;
                setPost(docData);
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
            <div className="min-h-screen bg-[#161616] text-white">
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
            <div className="min-h-screen bg-[#161616] text-white">
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
        <div className="min-h-screen bg-[#161616] text-white selection:bg-[#EFCC3A]/30">
            <SEO
                title={`${post.title} — Co-Interview Blog`}
                description={post.description || post.title}
            />
            <Banner />
            <Navbar />

            <main className="pt-8 pb-24">
                {/* Hero Section */}
                <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden">
                    <img
                        src={post.imageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#161616] via-[#161616]/60 to-transparent"></div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-6 -mt-24 relative z-10">
                    {/* Back Link */}
                    <Link
                        to="/blog"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Blog
                    </Link>

                    {/* Meta */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <time>{post.date}</time>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime} read</span>
                        </div>
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 hover:text-[#EFCC3A] transition-colors ml-auto"
                        >
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-8">
                        {post.title}
                    </h1>

                    {/* Article Content */}
                    <article
                        className="prose prose-lg prose-invert max-w-none
                            prose-headings:text-white prose-headings:font-bold
                            prose-p:text-gray-300 prose-p:leading-relaxed
                            prose-a:text-[#EFCC3A] prose-a:no-underline hover:prose-a:underline
                            prose-strong:text-white
                            prose-code:text-[#EFCC3A] prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                            prose-pre:bg-[#0A0A0A] prose-pre:border prose-pre:border-white/10
                            prose-blockquote:border-l-[#EFCC3A] prose-blockquote:text-gray-400
                            prose-li:text-gray-300"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />

                    {/* CTA Section */}
                    <div className="mt-16 p-8 bg-gradient-to-r from-[#EFCC3A]/10 to-transparent rounded-2xl border border-[#EFCC3A]/20">
                        <h3 className="text-2xl font-bold mb-4">Ready to ace your next interview?</h3>
                        <p className="text-gray-400 mb-6">
                            Get real-time AI assistance during your technical interviews with Co-Interview.
                        </p>
                        <a
                            href="/#download"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-[#EFCC3A] text-black font-semibold rounded-lg hover:bg-[#d4b534] transition-colors"
                        >
                            Join the Waitlist
                        </a>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default BlogPostPage;

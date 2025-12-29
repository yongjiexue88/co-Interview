import React from 'react';
import SEO from '../components/SEO';
import Banner from '../components/Banner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import BlogHero from '../components/blog/BlogHero';
import BlogList from '../components/blog/BlogList';
import { FEATURED_POST, BLOG_GROUPS } from '../content/blogData';

const BlogPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#161616] text-white selection:bg-[#EFCC3A]/30">
            <SEO
                title="Blog — Co-Interview"
                description="Tips, strategies, and insights for acing your technical interviews with AI-powered assistance."
            />
            <Banner />
            <Navbar />
            <main className="pt-6">
                <BlogHero />
                <BlogList groups={BLOG_GROUPS} featuredPost={FEATURED_POST} />
            </main>
            <Footer />
        </div>
    );
};

export default BlogPage;

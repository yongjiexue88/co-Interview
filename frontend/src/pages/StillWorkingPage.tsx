import React, { useEffect } from 'react';
import Article from '../components/Article';
import SEO from '../components/SEO';
import Banner from '../components/Banner';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Main Page Component
const StillWorkingPage: React.FC = () => {
    // Scroll to top when page loads
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30 overflow-x-hidden">
            <SEO
                title="How it Works — Co-Interview AI Assistant"
                description="See how Co-Interview's undetectable AI features work. From invisible overlays to real-time coding assistance, discover the technology that helps you pass technical interviews."
                canonicalUrl="https://co-interview.com/still_working"
            />
            <Banner />
            <Navbar />
            <main className="relative z-10">
                <Article />
            </main>
            <Footer />

            {/* Floating Chat Bubble */}
            <div className="fixed bottom-6 right-6 z-50">
                <button className="w-12 h-12 bg-[#FACC15] rounded-full flex items-center justify-center text-black shadow-lg hover:scale-105 transition-transform">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default StillWorkingPage;

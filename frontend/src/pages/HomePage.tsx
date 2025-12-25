import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import UndetectableFeatures from '../components/UndetectableFeatures';
import Testimonials from '../components/Testimonials';
import Compatibility from '../components/Compatibility';
import Pricing from '../components/Pricing';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';
import Banner from '../components/Banner';
import SEO from '../components/SEO';

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
            <SEO
                title="Co-Interview - Ace Your Technical Interviews | AI Copilot"
                description="The ultimate AI interview assistant for software engineers. Co-Interview provides real-time, undetectable coding help for FAANG, HackerRank, and LeetCode interviews."
                canonicalUrl="https://co-interview.com/"
            />
            <Banner />
            <Navbar />
            <main>
                <Hero />
                <UndetectableFeatures />
                <Testimonials />
                <Compatibility />
                <Pricing />
                <FAQ />
            </main>
            <Footer />
        </div>
    );
};

export default HomePage;

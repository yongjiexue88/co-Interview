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
import { generateOrganizationSchema, generateWebSiteSchema, generateProductSchema, generateFAQSchema } from '../utils/schemaGenerator';
import { pricingTiers } from '../content/pricing';
import { faqItems } from '../content/siteContent';

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
            <SEO
                title="Co-Interview — AI Interview Copilot for Technical Interviews"
                description="The premier real-time interview assistant for technical coding interviews. Co-Interview provides undetectable support for Zoom, Teams, and Google Meet to help you ace FAANG, HackerRank, and LeetCode assessments."
                canonicalUrl="https://co-interview.com/"
                jsonLd={[
                    generateOrganizationSchema(),
                    generateWebSiteSchema(),
                    generateProductSchema(pricingTiers),
                    generateFAQSchema(faqItems)
                ]}
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

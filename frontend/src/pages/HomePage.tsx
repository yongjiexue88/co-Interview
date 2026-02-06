import React from 'react';
import SimpleNavbar from '../components/SimpleNavbar';
import SimpleHero from '../components/SimpleHero';
import SocialProof from '../components/SocialProof';
import UndetectableSection from '../components/UndetectableSection';
import FeaturesGrid from '../components/FeaturesGrid';
import SimpleFAQ from '../components/SimpleFAQ';
import FinalCTASection from '../components/FinalCTASection';
import SimpleFooter from '../components/SimpleFooter';
import SEO from '../components/SEO';
import { generateOrganizationSchema, generateWebSiteSchema, generateProductSchema, generateFAQSchema } from '../utils/schemaGenerator';
import { pricingTiers } from '../content/pricing';
import { faqItems } from '../content/siteContent';

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-yellow-500/30">
            <SEO
                title="Co-Interview — AI Interview Copilot for Technical Interviews"
                description="The premier real-time interview assistant for technical coding interviews. Co-Interview provides undetectable support for Zoom, Teams, and Google Meet to help you ace FAANG, HackerRank, and LeetCode assessments."
                canonicalUrl="https://co-interview.com/"
                keywords={['interview copilot', 'ai interview assistant', 'coding interview help', 'leetcode helper', 'technical interview cheat sheet', 'real-time coding interview support']}
                image="https://co-interview.com/visual-one.png"
                jsonLd={[generateOrganizationSchema(), generateWebSiteSchema(), generateProductSchema(pricingTiers), generateFAQSchema(faqItems)]}
            />
            <SimpleNavbar />
            <main>
                <SimpleHero />
                <SocialProof />
                <UndetectableSection />
                <FeaturesGrid />
                <SimpleFAQ />
                <FinalCTASection />
            </main>
            <SimpleFooter />
        </div>
    );
};

export default HomePage;

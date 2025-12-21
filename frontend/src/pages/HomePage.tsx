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

const HomePage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30">
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

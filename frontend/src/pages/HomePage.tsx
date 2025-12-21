import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import GeminiDemo from '../components/GeminiDemo';
import Pricing from '../components/Pricing';
import Footer from '../components/Footer';
import Banner from '../components/Banner';

const HomePage: React.FC = () => {
    return (
        <>
            <Banner />
            <Navbar />
            <main>
                <Hero />
                <Features />
                <GeminiDemo />
                <Pricing />
            </main>
            <Footer />
        </>
    );
};

export default HomePage;

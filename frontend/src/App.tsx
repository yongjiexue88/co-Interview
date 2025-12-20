import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import GeminiDemo from './components/GeminiDemo';
import Pricing from './components/Pricing';
import Footer from './components/Footer';
import Banner from './components/Banner';

function App() {
    return (
        <div className="min-h-screen bg-background text-white selection:bg-[#EFCC3A]/30">
            <Banner />
            <Navbar />
            <main>
                <Hero />
                <Features />
                <GeminiDemo />
                <Pricing />
            </main>
            <Footer />
        </div>
    );
}

export default App;

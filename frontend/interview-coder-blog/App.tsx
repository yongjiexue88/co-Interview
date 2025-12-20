import React from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeaturedPost } from './components/FeaturedPost';
import { BlogList } from './components/BlogList';
import { CallToAction } from './components/CallToAction';
import { Footer } from './components/Footer';
import { FEATURED_POST, BLOG_GROUPS } from './data';

function App() {
  return (
    <div className="min-h-screen bg-dark-bg text-dark-text font-sans selection:bg-brand-yellow/30 selection:text-brand-yellow">
      <Navbar />
      
      <main className="relative z-10">
        <Hero />
        
        <FeaturedPost post={FEATURED_POST} />
        
        <div className="relative">
           <BlogList groups={BLOG_GROUPS} />
        </div>

        <CallToAction />
      </main>

      <Footer />
    </div>
  );
}

export default App;
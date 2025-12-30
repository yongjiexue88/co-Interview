import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Banner from './Banner';
import SEO from './SEO';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface PolicyDetailLayoutProps {
    title: string;
    description: string;
    children: React.ReactNode;
    maxWidth?: string;
}

const PolicyDetailLayout: React.FC<PolicyDetailLayoutProps> = ({ title, description, children, maxWidth = "max-w-3xl" }) => {
    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-[#EFCC3A]/30">
            <SEO
                title={`${title} — Co-Interview`}
                description={description}
            />
            <Banner />
            <Navbar />

            <main className="pt-24 pb-32 px-6 lg:px-8">
                <div className={`${maxWidth} mx-auto`}>
                    <Link
                        to="/policies"
                        className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors text-sm"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Policies
                    </Link>

                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-12">{title}</h1>

                    <div className="prose prose-invert prose-lg text-gray-300 max-w-none">
                        {children}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PolicyDetailLayout;

import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Banner from '../components/Banner';
import SEO from '../components/SEO';

const PoliciesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-[#EFCC3A]/30">
            <SEO title="Our Policies — Co-Interview" description="Terms of Service, Refund Policy, and Privacy Policy for Co-Interview." />
            <Banner />
            <Navbar />

            <main className="pt-24 pb-32 px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-center text-white mb-16">Our Policies</h1>

                    <div className="space-y-6">
                        {/* Privacy Policy Card */}
                        <Link
                            to="/policies/privacy"
                            className="block bg-[#111] border border-white/10 rounded-xl p-8 hover:border-white/20 transition-colors"
                        >
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Privacy Policy</h2>
                            <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                                Details about how we collect, use, and protect your personal information, and your rights regarding your data.
                            </p>
                        </Link>

                        {/* Terms of Service Card */}
                        <Link
                            to="/policies/terms"
                            className="block bg-[#111] border border-white/10 rounded-xl p-8 hover:border-white/20 transition-colors"
                        >
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Terms of Service</h2>
                            <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                                Our terms of service outline the rules and guidelines for using LockedIn AI, including licensing, user conduct, and
                                service changes.
                            </p>
                        </Link>

                        {/* Refund Policy Card */}
                        <Link
                            to="/policies/refund"
                            className="block bg-[#111] border border-white/10 rounded-xl p-8 hover:border-white/20 transition-colors"
                        >
                            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">Refund Policy</h2>
                            <p className="text-gray-400 leading-relaxed text-base md:text-lg">
                                Information about our refund policy, cancellation process, and subscription details.
                            </p>
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PoliciesPage;

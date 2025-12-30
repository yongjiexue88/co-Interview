import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Banner from '../components/Banner';
import SEO from '../components/SEO';

const PoliciesPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#000000] text-white selection:bg-[#EFCC3A]/30">
            <SEO
                title="Legal Policies — Co-Interview"
                description="Terms of Service, Refund Policy, and Cancellation Policy for Co-Interview."
            />
            <Banner />
            <Navbar />

            <main className="pt-24 pb-24 px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-12">Legal Policies</h1>

                    <div className="space-y-16">
                        {/* Terms of Service */}
                        <section id="terms">
                            <h2 className="text-2xl font-bold text-[#EFCC3A] mb-6">Terms of Service</h2>
                            <div className="prose prose-invert prose-lg text-gray-300">
                                <p>
                                    By using Co-Interview, you agree to these terms. Our service is provided "as is" and intended to assist with technical interview preparation.
                                </p>
                                <p>
                                    Users are responsible for ensuring their use of the application complies with all applicable agreements and policies of third-party platforms.
                                </p>
                                <p>
                                    We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of any changes.
                                </p>
                            </div>
                        </section>

                        {/* Refund Policy */}
                        <section id="refund">
                            <h2 className="text-2xl font-bold text-[#EFCC3A] mb-6">Refund Policy</h2>
                            <div className="prose prose-invert prose-lg text-gray-300">
                                <p>
                                    We offer a 100% money-back guarantee if the software does not work as described on your system.
                                </p>
                                <p>
                                    To request a refund, please contact support within 7 days of your purchase with details of the issue. We may request basic troubleshooting steps to verify the problem before processing the refund.
                                </p>
                            </div>
                        </section>

                        {/* Cancellation Policy */}
                        <section id="cancellation">
                            <h2 className="text-2xl font-bold text-[#EFCC3A] mb-6">Cancellation Policy</h2>
                            <div className="prose prose-invert prose-lg text-gray-300">
                                <p>
                                    For subscription-based plans, you may cancel your subscription at any time via your account settings or the payment provider's portal.
                                </p>
                                <p>
                                    Cancellation prevents future charges but does not grant a refund for the current billing period. You will retain access to the service until the end of your billing cycle.
                                </p>
                            </div>
                        </section>

                        <section className="border-t border-white/10 pt-8 mt-12">
                            <p className="text-gray-400 text-sm">
                                Last updated: December 2025
                            </p>
                            <p className="text-gray-400 text-sm mt-2">
                                Contact: support@co-interview.com
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PoliciesPage;

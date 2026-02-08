import React from 'react';

const FinalCTASection: React.FC = () => {
    return (
        <section className="bg-white py-20">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Divider Line */}
                <div className="w-16 h-0.5 bg-gray-300 mx-auto mb-12"></div>

                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Ready to start?</h2>
                <p className="text-lg text-gray-600 mb-10">Join 60,000+ users.</p>
                <a
                    href="#download"
                    onClick={() => {
                        import('../lib/analytics').then(({ trackEvent }) => {
                            trackEvent('cta_click', {
                                location: 'final_cta_section',
                                button_text: 'Download for macOS',
                            });
                        });
                    }}
                    className="inline-block px-10 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-lg"
                >
                    Download for macOS
                </a>
            </div>
        </section>
    );
};

export default FinalCTASection;

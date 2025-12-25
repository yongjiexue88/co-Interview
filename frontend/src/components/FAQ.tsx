import React, { useState } from 'react';
import { faqItems } from '../content/siteContent';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQ: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <section className="py-20 lg:py-32 bg-[#161616]">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Got Questions?<br />
                        <span className="text-[#FACC15]">We've Got Answers</span>
                    </h2>
                </div>

                {/* FAQ Items */}
                <div className="space-y-4">
                    {faqItems.map((item, index) => (
                        <div
                            key={index}
                            className="bg-[#1a1a1a] border border-white/5 rounded-xl overflow-hidden"
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
                            >
                                <span className="text-white font-medium pr-4">{item.question}</span>
                                {openIndex === index ? (
                                    <ChevronUp className="w-5 h-5 text-[#FACC15] flex-shrink-0" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                )}
                            </button>

                            {openIndex === index && (
                                <div className="px-6 pb-6">
                                    <p className="text-gray-400 leading-relaxed">
                                        {item.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Contact CTA */}
                <div className="mt-12 text-center">
                    <p className="text-gray-400 mb-4">Couldn't find your answer?</p>
                    <a
                        href="mailto:support@co-interview.com"
                        className="inline-flex items-center gap-2 text-[#FACC15] hover:underline"
                    >
                        <HelpCircle className="w-4 h-4" />
                        Send us an email at support@co-interview.com
                    </a>
                </div>
            </div>
        </section>
    );
};

export default FAQ;

import React from 'react';
import { testimonials } from '../content/siteContent';
import { CheckCircle, Play } from 'lucide-react';

const Testimonials: React.FC = () => {
    return (
        <section className="py-20 lg:py-32 bg-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
                        Co-Interview Working on <span className="text-[#FACC15]">Real Interviews</span>
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        See how candidates use Co-Interview to land offers at top tech companies
                    </p>
                </div>

                {/* Video Feature Card */}
                <div className="max-w-4xl mx-auto mb-16">
                    <div className="relative bg-[#111] border border-white/10 rounded-2xl overflow-hidden group cursor-pointer">
                        {/* Video Thumbnail Placeholder */}
                        <div className="aspect-video bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] flex items-center justify-center relative">
                            {/* Play Button */}
                            <div className="w-20 h-20 bg-[#FACC15] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play className="w-8 h-8 text-black ml-1" fill="currentColor" />
                            </div>

                            {/* Badge */}
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/80 backdrop-blur-sm border border-white/10 rounded-full px-3 py-1">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="h-4 invert" />
                                <span className="text-xs text-white font-medium">Software Engineer OA + Interview</span>
                            </div>
                        </div>

                        {/* Caption */}
                        <div className="p-6">
                            <p className="text-gray-300">
                                "I'll show you how I got an offer from Amazon using Co-Interview. Throughout this whole video, you'll see me use Co-Interview for both the OA and the final round."
                            </p>
                            <a href="#" className="inline-flex items-center gap-2 text-[#FACC15] text-sm mt-4 hover:underline">
                                Full video here →
                            </a>
                        </div>
                    </div>
                </div>

                {/* Testimonials Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-[#111] border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                {/* Avatar */}
                                <div className="w-10 h-10 bg-gradient-to-br from-[#FACC15] to-yellow-600 rounded-full flex items-center justify-center text-black font-bold">
                                    {testimonial.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-medium">{testimonial.name}</span>
                                        {testimonial.verified && (
                                            <CheckCircle className="w-4 h-4 text-[#FACC15]" />
                                        )}
                                    </div>
                                    {testimonial.company && (
                                        <span className="text-xs text-gray-500">{testimonial.company}</span>
                                    )}
                                </div>
                            </div>

                            {/* Content */}
                            <p className="text-gray-400 text-sm leading-relaxed">
                                "{testimonial.content}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;

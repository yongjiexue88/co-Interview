import React from 'react';
import { Star, Flame } from 'lucide-react';

const SocialProof: React.FC = () => {
    return (
        <section className="bg-white py-12 border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Stats */}
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 mb-12">
                    {/* Stat 1 */}
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-yellow-50 rounded-full flex items-center justify-center">
                            <Star className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">5K+</p>
                            <p className="text-sm text-gray-500">5-star reviews</p>
                        </div>
                    </div>

                    {/* Stat 2 */}
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center">
                            <Flame className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-gray-900">60K+</p>
                            <p className="text-sm text-gray-500">Interviews aced</p>
                        </div>
                    </div>
                </div>

                {/* Company Logos */}
                <div className="text-center">
                    <p className="text-sm text-gray-400 mb-6">Trusted by developers hired at</p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-50 grayscale">
                        {/* Amazon */}
                        <svg className="h-6" viewBox="0 0 603 182" fill="currentColor">
                            <path d="M374.00 142.25c-34.03 25.08-83.38 38.48-125.89 38.48c-59.55 0-113.22-22.03-153.79-58.64c-3.19-2.88-0.33-6.81 3.49-4.57c43.8 25.48 97.96 40.82 153.92 40.82c37.74 0 79.27-7.82 117.5-23.99c5.77-2.46 10.61 3.78 4.77 7.91z" />
                            <path d="M387.82 126.5c-4.35-5.57-28.79-2.63-39.76-1.33c-3.34 0.41-3.85-2.5-0.84-4.6c19.47-13.7 51.42-9.74 55.15-5.15c3.73 4.62-0.97 36.61-19.26 51.87c-2.81 2.35-5.49 1.1-4.24-2.02c4.11-10.26 13.3-33.22 8.94-38.78z" />
                        </svg>

                        {/* HackerRank Text */}
                        <span className="text-lg font-semibold text-gray-700">HackerRank</span>

                        {/* EPAM Text */}
                        <span className="text-lg font-semibold text-gray-700">EPAM</span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SocialProof;

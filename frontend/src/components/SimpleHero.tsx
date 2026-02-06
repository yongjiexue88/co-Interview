import React from 'react';

const SimpleHero: React.FC = () => {
    return (
        <section className="bg-white py-16 lg:py-24">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Main Headline */}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6">
                    Ace your coding interviews with
                    <br />
                    <span className="text-gray-900">AI-powered assistance</span>
                </h1>

                {/* Subheadline */}
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
                    The premier real-time interview assistant for coding interviews. Get undetectable support across Zoom, Teams, and Google Meet.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                    <a
                        href={`https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/releases%2Fco-interview.dmg?alt=media`}
                        download
                        onClick={() => {
                            import('../lib/analytics').then(({ trackEvent }) => {
                                trackEvent('download_click', {
                                    platform: 'macOS',
                                    location: 'hero',
                                    file_type: 'dmg',
                                });
                            });
                        }}
                        className="px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-colors shadow-lg"
                    >
                        Download for macOS
                    </a>
                    <a
                        href="https://github.com/yongjiexue88/co-Interview"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                            import('../lib/analytics').then(({ trackEvent }) => {
                                trackEvent('external_link_click', {
                                    destination: 'github',
                                    location: 'hero',
                                    url: 'https://github.com/yongjiexue88/co-Interview',
                                });
                            });
                        }}
                        className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-full border-2 border-gray-200 hover:border-gray-400 transition-colors"
                    >
                        View on GitHub
                    </a>
                </div>

                {/* Product Mockup */}
                <div className="relative max-w-4xl mx-auto">
                    <div className="bg-gray-900 rounded-xl shadow-2xl overflow-hidden border border-gray-800">
                        {/* Window Header */}
                        <div className="flex items-center px-4 py-3 bg-gray-800 border-b border-gray-700">
                            <div className="flex space-x-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <span className="ml-4 text-xs text-gray-400 font-mono">co-interview — Connected</span>
                        </div>

                        {/* Mock Content */}
                        <div className="p-6 md:p-8 text-left">
                            <div className="space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-green-400"></div>
                                    <div>
                                        <p className="text-gray-400 text-sm font-mono">Analyzing interview question...</p>
                                        <p className="text-white font-mono text-sm mt-2">
                                            <span className="text-purple-400">function</span> <span className="text-yellow-300">twoSum</span>
                                            <span className="text-gray-400">(nums, target)</span> {'{'}
                                        </p>
                                        <p className="text-white font-mono text-sm pl-4">
                                            <span className="text-purple-400">const</span> map = <span className="text-purple-400">new</span>{' '}
                                            <span className="text-yellow-300">Map</span>();
                                        </p>
                                        <p className="text-white font-mono text-sm pl-4">
                                            <span className="text-purple-400">for</span> (<span className="text-purple-400">let</span> i = 0; i &lt;
                                            nums.length; i++) {'{'}
                                        </p>
                                        <p className="text-white font-mono text-sm pl-8">
                                            <span className="text-purple-400">const</span> complement = target - nums[i];
                                        </p>
                                        <p className="text-gray-500 font-mono text-sm pl-8">{'// Solution continues...'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Badge */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#EFCC3A] text-black text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                            <span>LIVE ASSISTANCE</span>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SimpleHero;

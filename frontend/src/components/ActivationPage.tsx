import React from 'react';
import { Check, Star, Play } from 'lucide-react';
import Button from './ui/Button';
import Navbar from './Navbar';
import Footer from './Footer';
import { trackEvent } from '../lib/analytics';

const ActivationPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-black text-white selection:bg-yellow-500/30 flex flex-col">
            <Navbar />

            <main className="flex-grow flex flex-col items-center justify-center relative px-4 py-20 overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-[10%] left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]"></div>
                </div>

                <div className="max-w-4xl w-full relative z-10 text-center">
                    <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-1.5 rounded-full mb-8 text-sm font-medium animate-fadeIn">
                        <Check className="w-4 h-4" />
                        <span>You're on the list! + 14-day free trial locked in</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8 animate-fadeIn delay-100">
                        Here's how Interview Coder helps<br />
                        <span className="text-white">when you freeze</span>
                    </h1>

                    {/* Demo Placeholder */}
                    <div className="relative max-w-3xl mx-auto rounded-2xl overflow-hidden border border-white/10 shadow-2xl mb-12 animate-fadeIn delay-200 group">
                        <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>

                            {/* Placeholder for GIF/Video */}
                            <div className="text-gray-500 flex flex-col items-center">
                                <Play className="w-16 h-16 mb-4 text-white/50 group-hover:text-[#FACC15] transition-colors" />
                                <span className="font-mono text-sm">Demo Video Placeholder</span>
                            </div>

                            <div className="absolute bottom-6 left-6 text-left z-20">
                                <div className="text-white font-semibold text-lg mb-1">Live Coding Support</div>
                                <p className="text-gray-400 text-sm">See how we suggest lines of code in real-time.</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-16 animate-fadeIn delay-300">
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">
                                1
                            </div>
                            <h3 className="font-semibold text-white mb-2">Connects to call</h3>
                            <p className="text-sm text-gray-400">Works with Zoom, Meets, and Teams automatically.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left">
                            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">
                                2
                            </div>
                            <h3 className="font-semibold text-white mb-2">Listens & Solves</h3>
                            <p className="text-sm text-gray-400">Transcribes audio and solves coding problems instantly.</p>
                        </div>
                        <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left">
                            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4 text-[#FACC15]">
                                3
                            </div>
                            <h3 className="font-semibold text-white mb-2">You get the credit</h3>
                            <p className="text-sm text-gray-400">Subtle overlays keep you looking at the camera.</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center animate-fadeIn delay-500">
                        <Button
                            variant="primary"
                            size="lg"
                            className="w-full sm:w-auto min-w-[300px] text-lg py-6"
                            onClick={() => trackEvent('activation_priority_click', { source: 'activation_page' })}
                        >
                            Add me to Priority Access
                        </Button>
                        <p className="mt-4 text-gray-500 text-sm">
                            Limited spots available for beta release.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ActivationPage;

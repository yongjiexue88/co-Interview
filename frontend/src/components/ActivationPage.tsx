import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Check, Star, Play, ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import Navbar from './Navbar';
import Footer from './Footer';
import { trackEvent } from '../lib/analytics';

const ActivationPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(emailParam);
        }
    }, [searchParams]);

    const handleCreateAccount = () => {
        trackEvent('activation_create_account_click', { source: 'activation_page' });
        navigate(`/signup?email=${encodeURIComponent(email)}`);
    };

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
                        One last step to claim your
                        <br />
                        <span className="text-[#FACC15]">free trial</span>
                    </h1>

                    <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto animate-fadeIn delay-200">
                        Create your account now to secure your spot and start using Interview Coder.
                    </p>

                    <div className="flex flex-col items-center animate-fadeIn delay-300 mb-16">
                        <button
                            onClick={handleCreateAccount}
                            className="px-8 py-4 bg-gradient-to-r from-[#FACC15] to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-black font-semibold rounded-full transition-all duration-300 shadow-lg shadow-[#FACC15]/20 hover:shadow-[#FACC15]/30 flex items-center justify-center gap-2 min-w-[200px] text-lg"
                        >
                            <span>Create Your Account</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                        <p className="mt-4 text-gray-500 text-sm">It only takes 30 seconds.</p>
                    </div>

                    {/* How it works section */}
                    <div className="border-t border-white/10 pt-16 animate-fadeIn delay-500">
                        <h2 className="text-2xl font-bold mb-12">How it works</h2>
                        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left">
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-4 text-blue-400">1</div>
                                <h3 className="font-semibold text-white mb-2">Connects to call</h3>
                                <p className="text-sm text-gray-400">Works with Zoom, Meets, and Teams automatically.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left">
                                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 text-purple-400">2</div>
                                <h3 className="font-semibold text-white mb-2">Listens & Solves</h3>
                                <p className="text-sm text-gray-400">Transcribes audio and solves coding problems instantly.</p>
                            </div>
                            <div className="p-6 rounded-2xl bg-white/5 border border-white/5 text-left">
                                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center mb-4 text-[#FACC15]">3</div>
                                <h3 className="font-semibold text-white mb-2">You get the credit</h3>
                                <p className="text-sm text-gray-400">Subtle overlays keep you looking at the camera.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ActivationPage;

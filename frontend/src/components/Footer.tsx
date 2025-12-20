import React from 'react';
import { Terminal, Github, Twitter } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black border-t border-white/10 pt-20 pb-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">

                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-3 mb-6">
                            <div className="bg-[#EFCC3A] p-1.5 rounded-lg text-black">
                                <Terminal className="w-4 h-4 fill-current" />
                            </div>
                            <span className="text-lg font-bold text-white">InterviewCoder</span>
                        </div>
                        <p className="text-gray-400 text-sm max-w-sm leading-relaxed font-light">
                            The ultimate AI companion for technical interviews. We help you land your dream job by providing real-time assistance and deep explanations for complex coding problems.
                        </p>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Product</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-[#EFCC3A] transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-[#EFCC3A] transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-[#EFCC3A] transition-colors">Extension</a></li>
                            <li><a href="#" className="hover:text-[#EFCC3A] transition-colors">Changelog</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white font-bold mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-[#EFCC3A] transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-[#EFCC3A] transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-[#EFCC3A] transition-colors">Disclaimer</a></li>
                            <li><a href="#" className="hover:text-[#EFCC3A] transition-colors">Contact</a></li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between">
                    <p className="text-gray-600 text-xs">
                        © {new Date().getFullYear()} InterviewCoder. All rights reserved. Not affiliated with LeetCode.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-500 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

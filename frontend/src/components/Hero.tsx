import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import Button from './ui/Button';

// Simple Icons as SVG components
const AppleIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.78 1.18-.19 2.31-.89 3.51-.84 1.54.06 2.68.75 3.37 1.84-2.88 1.63-2.31 5.7.5 7.15-.46 1.35-1.02 2.71-2.46 4.04zm-4.32-8.11c-.55-2.88 2.38-5.23 4.96-5.04.14 2.82-2.83 5.43-4.96 5.04z" />
    </svg>
);

const WindowsIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M0 3.449L9.75 2.1v9.451H0V3.449zm10.949-1.67L24 0v11.4H10.949V1.779zM0 12.6h9.75v9.451L0 20.699V12.6zm10.949 0H24V24l-13.051-1.83V12.6z" />
    </svg>
);

const Hero: React.FC = () => {
    return (
        <div className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-black">

            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[-100px] left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

                {/* Badge */}
                <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-10 hover:bg-white/10 transition-colors cursor-pointer group backdrop-blur-sm">
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">🎉 2.0 is here <span className="text-gray-500 mx-1">|</span> See what's new</span>
                    <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                    <span className="block text-white mb-2">Meet</span>
                    <span className="block text-[#4b5563] relative inline-block">
                        Co-Interview 2.0
                        <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent blur-[2px]">Co-Interview 2.0</span>
                    </span>
                </h1>

                <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                    Now upgraded with <span className="text-white font-medium">audio support</span> and 20+ <span className="text-white font-medium">cutting-edge</span> undetectability <br className="hidden md:block" />
                    features to keep you invisible across every interview check.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-24">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px] space-x-3">
                        <AppleIcon />
                        <span>Get for Mac</span>
                    </Button>
                    <Button variant="primary" size="lg" className="w-full sm:w-auto min-w-[200px] space-x-3">
                        <WindowsIcon />
                        <span>Get for Windows</span>
                    </Button>
                </div>

                {/* Mock Interface */}
                <div className="relative max-w-6xl mx-auto perspective-1000">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#EFCC3A] via-yellow-500 to-[#EFCC3A] rounded-2xl blur opacity-20"></div>

                    <div className="relative rounded-2xl bg-[#0a0a0a] border border-white/10 shadow-2xl overflow-hidden text-left transform rotate-x-10 transition-transform duration-700 hover:scale-[1.01]">

                        {/* Overlay Elements for effect */}
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#EFCC3A] text-black text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-20 flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
                            <span>INVISIBLE ON DOCK</span>
                        </div>

                        {/* Window Header */}
                        <div className="flex items-center px-4 py-3 bg-[#111] border-b border-white/5">
                            <div className="flex space-x-2 mr-4">
                                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
                            </div>
                            <div className="flex-1 text-center text-xs text-gray-500 font-mono">
                                LeetCode Problem List
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row h-[600px] bg-black">
                            {/* Problem List (Left) */}
                            <div className="w-full md:w-2/3 p-8 border-r border-white/5 overflow-hidden relative">
                                <div className="mb-6 flex items-center justify-between">
                                    <h3 className="text-xl font-semibold text-white flex items-center">
                                        <span className="w-2 h-2 rounded-full bg-[#EFCC3A] mr-3"></span>
                                        Longest Consecutive Sequence
                                    </h3>
                                    <span className="px-3 py-1 bg-white/5 text-gray-400 text-xs rounded-full border border-white/5">Medium</span>
                                </div>

                                <div className="space-y-4 text-gray-400 text-sm leading-relaxed mb-8">
                                    <p>Given an unsorted array of integers <code className="text-[#EFCC3A]">nums</code>, return the length of the longest consecutive elements sequence.</p>
                                    <p>You must write an algorithm that runs in <code className="text-[#EFCC3A]">O(n)</code> time.</p>
                                </div>

                                <div className="bg-[#111] p-4 rounded-xl border border-white/5 mb-6">
                                    <p className="font-mono text-xs text-gray-500 mb-2">Example 1:</p>
                                    <div className="font-mono text-xs text-gray-300">
                                        Input: nums = [100, 4, 200, 1, 3, 2]<br />
                                        Output: 4<br />
                                        Explanation: The longest consecutive elements sequence is [1, 2, 3, 4]. Therefore its length is 4.
                                    </div>
                                </div>
                            </div>

                            {/* Solution/Overlay (Right) */}
                            <div className="w-full md:w-1/3 bg-[#050505] p-6 relative border-l border-white/5">
                                {/* Floating Solution Overlay */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] bg-[#111]/90 backdrop-blur-xl border border-[#EFCC3A]/30 rounded-xl p-5 shadow-2xl shadow-[#EFCC3A]/10">
                                    <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="bg-[#EFCC3A] p-1 rounded">
                                                <Star className="w-3 h-3 text-black fill-current" />
                                            </div>
                                            <span className="text-xs font-bold text-white">SOLUTION DETECTED</span>
                                        </div>
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 rounded-full bg-[#EFCC3A]"></div>
                                            <div className="w-2 h-2 rounded-full bg-[#EFCC3A]/50"></div>
                                            <div className="w-2 h-2 rounded-full bg-[#EFCC3A]/20"></div>
                                        </div>
                                    </div>

                                    <div className="font-mono text-[10px] text-gray-300 leading-relaxed mb-4">
                                        <span className="text-purple-400">class</span> <span className="text-yellow-200">Solution</span>:<br />
                                        &nbsp;&nbsp;<span className="text-purple-400">def</span> <span className="text-blue-400">longestConsecutive</span>(self, nums):<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;num_set = <span className="text-purple-400">set</span>(nums)<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;longest = 0<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">for</span> num <span className="text-purple-400">in</span> num_set:<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">if</span> num - 1 <span className="text-purple-400">not in</span> num_set:<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;current_num = num<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;current_streak = 1<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">while</span> current_num + 1 <span className="text-purple-400">in</span> num_set:<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;current_num += 1<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;current_streak += 1<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;longest = <span className="text-purple-400">max</span>(longest, current_streak)<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">return</span> longest
                                    </div>

                                    <Button variant="primary" size="sm" className="w-full text-xs h-9">
                                        Solve Answer (⌘ + ↵)
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Hero;

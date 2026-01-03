import React from 'react';
import { ArrowRight, Star } from 'lucide-react';
import Button from './ui/Button';
import { useExperiment } from '../hooks/useExperiment';

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
    const variant = useExperiment('hero_headline_v1', ['A', 'B']);
    const headlineText = variant === 'A' ? 'Pass Any Technical Interview' : 'Never Freeze During a Coding Interview Again';

    return (
        <div className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden bg-black">
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                <div className="absolute top-[-100px] left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                {/* Badge */}
                <div
                    className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 mb-10 hover:bg-white/10 transition-colors cursor-pointer group backdrop-blur-sm"
                    onClick={() => import('../lib/analytics').then(m => m.trackEvent('hero_badge_click', { label: '2.0 Announcement' }))}
                >
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                        🎉 2.0 is here <span className="text-gray-500 mx-1">|</span> See what's new
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-500 group-hover:text-white transition-colors" />
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
                    <span className="block text-white mb-2">{headlineText}</span>
                    <span className="block text-[#4b5563] relative inline-block">
                        Co-Interview 2.0
                        <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent blur-[2px]">
                            Co-Interview 2.0
                        </span>
                    </span>
                </h1>

                <p className="mt-6 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                    Now upgraded with <span className="text-white font-medium">audio support</span> and 20+{' '}
                    <span className="text-white font-medium">cutting-edge</span> undetectability <br className="hidden md:block" />
                    features to keep you invisible across every interview check.
                </p>

                {/* === DOWNLOAD BUTTONS === */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
                    {/* Mac Dropdown Button */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 bg-[#EFCC3A] hover:bg-[#f5d742] text-black px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-[#EFCC3A]/20 hover:shadow-[#EFCC3A]/40 min-w-[200px] justify-center">
                            <AppleIcon />
                            <span>Get for Mac</span>
                        </button>
                        {/* Dropdown Menu */}
                        <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden">
                            <a
                                href={`https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/releases%2Fmac-arm64.dmg?alt=media`}
                                download
                                className="block px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm font-medium"
                            >
                                Get for Mac (Apple Silicon)
                            </a>
                            <a
                                href={`https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/releases%2Fmac-x64.dmg?alt=media`}
                                download
                                className="block px-4 py-3 text-white hover:bg-white/10 transition-colors text-sm font-medium border-t border-white/5"
                            >
                                Get for Mac (Intel)
                            </a>
                        </div>
                    </div>
                    {/* Windows Button */}
                    <a
                        href={`https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/releases%2Fwindows.zip?alt=media`}
                        download
                        className="group flex items-center gap-3 bg-[#EFCC3A] hover:bg-[#f5d742] text-black px-8 py-4 rounded-full font-semibold transition-all duration-300 shadow-lg shadow-[#EFCC3A]/20 hover:shadow-[#EFCC3A]/40 min-w-[200px] justify-center"
                    >
                        <WindowsIcon />
                        <span>Get for Windows</span>
                    </a>
                </div>
                {/* === END DOWNLOAD BUTTONS === */}

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
                            <div className="flex-1 text-center text-xs text-gray-500 font-mono">LeetCode Problem List</div>
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
                                    <p>
                                        Given an unsorted array of integers <code className="text-[#EFCC3A]">nums</code>, return the length of the
                                        longest consecutive elements sequence.
                                    </p>
                                    <p>
                                        You must write an algorithm that runs in <code className="text-[#EFCC3A]">O(n)</code> time.
                                    </p>
                                </div>

                                <div className="bg-[#111] p-4 rounded-xl border border-white/5 mb-6">
                                    <p className="font-mono text-xs text-gray-500 mb-2">Example 1:</p>
                                    <div className="font-mono text-xs text-gray-300">
                                        Input: nums = [100, 4, 200, 1, 3, 2]
                                        <br />
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
                                        &nbsp;&nbsp;<span className="text-purple-400">def</span>{' '}
                                        <span className="text-blue-400">longestConsecutive</span>(self, nums):
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;num_set = <span className="text-purple-400">set</span>(nums)
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;longest = 0<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">for</span> num{' '}
                                        <span className="text-purple-400">in</span> num_set:
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">if</span> num - 1{' '}
                                        <span className="text-purple-400">not in</span> num_set:
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;current_num = num
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;current_streak = 1<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="text-purple-400">while</span> current_num + 1{' '}
                                        <span className="text-purple-400">in</span> num_set:
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;current_num += 1<br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;current_streak += 1<br />
                                        <br />
                                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;longest = <span className="text-purple-400">max</span>
                                        (longest, current_streak)
                                        <br />
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

                {/* Social Proof - Company Logos */}
                <div className="mt-20 text-center">
                    <p className="text-sm text-gray-500 mb-8">Trusted by 97,000+ Devs Hired at Top Companies</p>
                    <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
                        {/* Google */}
                        <svg className="h-6 md:h-8" viewBox="0 0 272 92" fill="currentColor">
                            <path
                                fill="#4285F4"
                                d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                            />
                            <path
                                fill="#EA4335"
                                d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z"
                            />
                            <path fill="#4285F4" d="M225 3v65h-9.5V3h9.5z" />
                            <path
                                fill="#34A853"
                                d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z"
                            />
                            <path
                                fill="#EA4335"
                                d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.32 69.35.36 53.89.36 34.91.36 15.93 16.32.47 35.3.47c10.5 0 17.98 4.12 23.6 9.49l-6.64 6.64c-4.03-3.78-9.49-6.72-16.97-6.72-13.86 0-24.7 11.17-24.7 25.03 0 13.86 10.84 25.03 24.7 25.03 8.99 0 14.11-3.61 17.39-6.89 2.66-2.66 4.41-6.46 5.1-11.65l-22.49.01z"
                            />
                        </svg>
                        {/* Amazon */}
                        <svg className="h-5 md:h-6" viewBox="0 0 603 182" fill="#FF9900">
                            <path d="M374.00 142.25c-34.03 25.08-83.38 38.48-125.89 38.48c-59.55 0-113.22-22.03-153.79-58.64c-3.19-2.88-0.33-6.81 3.49-4.57c43.8 25.48 97.96 40.82 153.92 40.82c37.74 0 79.27-7.82 117.5-23.99c5.77-2.46 10.61 3.78 4.77 7.91z" />
                            <path d="M387.82 126.5c-4.35-5.57-28.79-2.63-39.76-1.33c-3.34 0.41-3.85-2.5-0.84-4.6c19.47-13.7 51.42-9.74 55.15-5.15c3.73 4.62-0.97 36.61-19.26 51.87c-2.81 2.35-5.49 1.1-4.24-2.02c4.11-10.26 13.3-33.22 8.94-38.78z" />
                        </svg>
                        {/* Meta */}
                        <svg className="h-6 md:h-8" viewBox="0 0 512 512" fill="#0668E1">
                            <path d="M483.9 243.5c0-34.2-6.7-66.7-18.9-96.5-12.2-29.8-29.8-56.1-51.7-78.1-21.9-22-48.3-39.4-78.1-51.6-29.8-12.2-62.3-18.8-96.5-18.8-34.2 0-66.7 6.6-96.5 18.8-29.8 12.2-56.2 29.6-78.1 51.6-21.9 22-39.5 48.3-51.7 78.1-12.2 29.8-18.9 62.3-18.9 96.5 0 31.7 5.8 62.2 16.4 90.4 10.6 28.2 25.9 53.3 44.8 74.7l-39.4 116.7c-1.2 3.6.3 7.5 3.5 9.4 1.4.8 3 1.2 4.6 1.2 2.2 0 4.3-.7 6-2.1l109.4-82.1c26.9 13.2 57.1 20.5 89.8 20.5 34.2 0 66.7-6.6 96.5-18.8 29.8-12.2 56.2-29.6 78.1-51.6 21.9-22 39.5-48.3 51.7-78.1 12.2-29.8 18.9-62.3 18.9-96.5v-3.8h-.1z" />
                        </svg>
                        {/* Netflix */}
                        <svg className="h-5 md:h-6" viewBox="0 0 111 30" fill="#E50914">
                            <path d="M105.06 14.28L111 30c-1.75-.25-3.499-.563-5.28-.845l-3.345-8.686-3.437 7.969c-1.687-.282-3.344-.376-5.031-.595l6.031-13.75L94.09 0H99.5l2.969 7.656L105.5 0h5.437l-5.875 14.28z" />
                            <path d="M90.07 14.28V30c-1.75-.06-3.5-.155-5.25-.251V0h5.25v14.28zM80.91 0v.563c-1.719.281-3.469.344-5.188.625V0h5.188zm0 6.561v23.157c-1.719.094-3.469.219-5.188.281V6.25l5.188.311z" />
                        </svg>
                        {/* Spotify */}
                        <svg className="h-6 md:h-8" viewBox="0 0 168 168" fill="#1DB954">
                            <path d="M84 0C37.8 0 0 37.8 0 84s37.8 84 84 84 84-37.8 84-84S130.2 0 84 0zm38.52 121.14c-1.5 2.46-4.72 3.24-7.18 1.74-19.68-12.02-44.44-14.74-73.58-8.08-2.82.66-5.62-1.1-6.28-3.9-.66-2.82 1.1-5.62 3.9-6.28 31.9-7.3 59.26-4.16 81.42 9.34 2.46 1.5 3.24 4.72 1.72 7.18zm10.28-22.86c-1.88 3.06-5.9 4.02-8.96 2.14-22.52-13.84-56.88-17.86-83.54-9.76-3.48 1.06-7.16-0.9-8.22-4.38-1.06-3.48.9-7.16 4.38-8.22 30.42-9.24 68.24-4.76 93.82 11.24 3.06 1.88 4.02 5.9 2.52 8.98zm0.88-23.82c-27.02-16.04-71.58-17.52-97.38-9.7-4.14 1.26-8.52-1.08-9.78-5.22-1.26-4.14 1.08-8.52 5.22-9.78 29.62-8.98 78.88-7.24 110 11.22 3.72 2.22 4.94 7.02 2.72 10.74-2.2 3.72-7 4.96-10.78 2.74z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Hero;

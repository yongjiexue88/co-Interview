import React from 'react';
import { Download, Info } from 'lucide-react';

interface VersionInfo {
    name: string;
    version: string;
    description: string;
    isLatest?: boolean;
}

const versions: VersionInfo[] = [
    {
        name: 'Interview Coder Pro 2.0',
        version: 'v2.0.0',
        description: 'Audio support and upgraded undetectability and performance.',
        isLatest: true,
    },
    {
        name: 'Interview Coder 1.0',
        version: 'v1.0.33',
        description: 'Streaming answers, improved prompt engineering.',
    },
];

const PreviousVersionsPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            {/* Latest Version */}
            <h2 className="text-xl font-semibold text-white mb-6">Latest Version</h2>
            <div className="bg-gradient-to-r from-[#FACC15]/20 to-[#FACC15]/5 border border-[#FACC15]/30 rounded-xl p-6 mb-12">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] rounded-xl flex items-center justify-center">
                            <img src="https://www.interviewcoder.co/logo.svg" alt="Pro" className="w-8 h-8" />
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <span className="text-white font-semibold">{versions[0].name}</span>
                                <span className="text-gray-400 text-sm">{versions[0].version}</span>
                            </div>
                        </div>
                    </div>
                    <button className="bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A] text-black font-semibold py-2 px-6 rounded-lg hover:brightness-110 transition-all">
                        Download
                    </button>
                </div>
                <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
                    <Info className="w-4 h-4" />
                    <span>{versions[0].description}</span>
                </div>
            </div>

            {/* Previous Versions */}
            <h2 className="text-xl font-semibold text-white mb-6">Previous Version</h2>
            <div className="space-y-4">
                {versions.slice(1).map((version, index) => (
                    <div key={index} className="bg-[#1a1a1a] border border-white/10 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-[#2a2a2a] rounded-xl flex items-center justify-center">
                                    <img src="https://www.interviewcoder.co/logo.svg" alt="Version" className="w-8 h-8 opacity-60" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-white font-semibold">{version.name}</span>
                                        <span className="text-gray-400 text-sm">{version.version}</span>
                                    </div>
                                </div>
                            </div>
                            <button className="border border-white/20 text-white font-semibold py-2 px-6 rounded-lg hover:bg-white/5 transition-all flex items-center gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-gray-400 text-sm">
                            <Info className="w-4 h-4" />
                            <span>{version.description}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PreviousVersionsPage;

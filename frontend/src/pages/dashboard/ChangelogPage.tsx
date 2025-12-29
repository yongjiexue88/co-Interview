import React from 'react';

interface ChangelogEntry {
    date: string;
    title: string;
    description: string;
    tag: 'NEW FEATURE' | 'IMPROVEMENT';
    images?: string[];
}

const changelogEntries: ChangelogEntry[] = [
    {
        date: 'Dec 21, 2025',
        title: 'Custom Prompt Manager Panel',
        description: 'You can now create, edit, and organize custom prompts in the new Prompt Manager panel. Quickly set an active prompt, reset to defaults, and keep your interview instructions consistent across sessions. (Mac only, windows coming soon)',
        tag: 'NEW FEATURE',
        images: [
            'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=300&h=200&fit=crop',
            'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop'
        ]
    },
    {
        date: 'Dec 7, 2025',
        title: 'Improved Password Reset Flow',
        description: 'We\'ve streamlined the password reset process to make recovering your account faster and easier.',
        tag: 'IMPROVEMENT'
    },
    {
        date: 'Dec 6, 2025',
        title: 'Password Security Enhancements',
        description: 'We\'ve added a password strength indicator to help you create more secure passwords and improved the overall password update experience.',
        tag: 'NEW FEATURE'
    },
    {
        date: 'Dec 6, 2025',
        title: 'Platform Updates & Bug Fixes',
        description: 'We\'ve made performance and security improvements across the platform and fixed several bugs.',
        tag: 'IMPROVEMENT'
    },
    {
        date: 'Dec 5, 2025',
        title: 'Enhanced Account Security',
        description: 'We\'ve strengthened our authentication system and password validation to keep your account more secure.',
        tag: 'NEW FEATURE'
    },
    {
        date: 'Dec 4, 2025',
        title: 'Performance Improvements',
        description: 'We\'ve optimized the platform for faster load times and improved overall performance.',
        tag: 'IMPROVEMENT'
    }
];

const ChangelogPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto px-8 py-12">
            <h1 className="text-4xl font-bold text-white mb-2">Changelog</h1>
            <p className="text-gray-400 mb-12">Stay updated with the latest changes and improvements to Interview Coder.</p>

            <div className="space-y-12">
                {changelogEntries.map((entry, index) => (
                    <div key={index} className="flex gap-8">
                        <div className="w-24 flex-shrink-0 text-right">
                            <span className="text-gray-500 text-sm">{entry.date}</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-white font-semibold">{entry.title}</h3>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${entry.tag === 'NEW FEATURE'
                                        ? 'bg-[#FACC15]/20 text-[#FACC15]'
                                        : 'bg-green-500/20 text-green-400'
                                    }`}>
                                    {entry.tag}
                                </span>
                            </div>
                            <p className="text-gray-400 text-sm leading-relaxed">{entry.description}</p>
                            {entry.images && (
                                <div className="flex gap-4 mt-4">
                                    {entry.images.map((img, imgIndex) => (
                                        <div key={imgIndex} className="w-48 h-32 rounded-lg overflow-hidden border border-white/10">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChangelogPage;

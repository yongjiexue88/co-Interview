import React from 'react';
import { Link } from 'react-router-dom';

const faqs = [
    {
        question: 'Where to get a free API key?',
        answer: (
            <>
                Follow{' '}
                <a href="/help#api-key" className="underline hover:text-gray-900">
                    this tutorial
                </a>{' '}
                to get a free API key.
            </>
        ),
    },
    {
        question: 'Sound is not working on macOS',
        answer: (
            <>
                Check{' '}
                <a href="/help#audio-permissions" className="underline hover:text-gray-900">
                    macOS audio permissions
                </a>{' '}
                for step-by-step instructions.
            </>
        ),
    },
    {
        question: "I'm getting a virus warning",
        answer: (
            <>
                macOS users:{' '}
                <a href="/help#installation-warning" className="underline hover:text-gray-900">
                    Follow this tutorial
                </a>
                <br />
                <br />
                The app is not code signed because I don't have a developer ID. This triggers security warnings but the app is safe. If you can help
                with code signing, join{' '}
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">
                    Discord
                </a>
                .
            </>
        ),
    },
    {
        question: 'I have another problem',
        answer: (
            <>
                Submit an issue on{' '}
                <a
                    href="https://github.com/yongjiexue88/co-Interview/issues"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-900"
                >
                    GitHub
                </a>{' '}
                or join{' '}
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-900">
                    Discord
                </a>{' '}
                for help.
            </>
        ),
    },
    {
        question: 'So you support cheating?',
        answer: 'No, cheating is cringe. Just be productive and get stuff done.',
    },
];

const DownloadPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link to="/" className="text-lg font-semibold text-gray-900 hover:underline">
                            Co-Interview
                        </Link>
                        <nav className="flex items-center space-x-6">
                            <Link to="/help" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                                Help
                            </Link>
                            <Link to="/download" className="text-sm font-medium text-gray-900">
                                Download
                            </Link>
                            <a
                                href="https://github.com/yongjiexue88/co-Interview"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-medium text-gray-600 hover:text-gray-900"
                            >
                                GitHub
                            </a>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Hero Section */}
                <div className="mb-16">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Download</h1>
                    <p className="text-lg text-gray-600">Get the latest version for your platform.</p>
                </div>

                {/* Divider */}
                <hr className="border-gray-200 mb-16" />

                {/* Latest Release Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Release</h2>
                    <div className="flex flex-wrap gap-4 mb-4">
                        <a
                            href="https://firebasestorage.googleapis.com/v0/b/co-interview-481814.firebasestorage.app/o/releases%2Fwindows.exe?alt=media"
                            download
                            className="px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            Windows
                        </a>
                        <a
                            href="https://firebasestorage.googleapis.com/v0/b/co-interview-481814.firebasestorage.app/o/releases%2Fmac-arm64.dmg?alt=media"
                            download
                            className="px-8 py-3 bg-black text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            macOS
                        </a>
                    </div>
                    <p className="text-sm text-gray-500">
                        Older releases available on{' '}
                        <a
                            href="https://github.com/yongjiexue88/co-Interview/releases"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-gray-900"
                        >
                            GitHub Releases
                        </a>
                    </p>
                </section>

                {/* Divider */}
                <hr className="border-gray-200 mb-16" />

                {/* FAQ Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">FAQ</h2>
                    <div className="space-y-8">
                        {faqs.map((faq, index) => (
                            <div key={index} className="border-b border-gray-200 last:border-b-0 pb-8 last:pb-0">
                                <h3 className="font-medium text-gray-900 mb-2">{faq.question}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Social Links */}
                    <nav className="flex flex-wrap items-center justify-center gap-6 mb-6">
                        <a
                            href="https://github.com/yongjiexue88/co-Interview"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            GitHub
                        </a>
                        <a
                            href="https://discord.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Discord
                        </a>
                        <a
                            href="https://x.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            X
                        </a>
                        <a
                            href="https://instagram.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Instagram
                        </a>
                        <a
                            href="https://tiktok.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            TikTok
                        </a>
                    </nav>

                    {/* Made by */}
                    <p className="text-sm text-gray-400">
                        Made by <span className="text-gray-600 underline">YX</span>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default DownloadPage;

import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ClearStoragePage: React.FC = () => {
    const [selectedOS, setSelectedOS] = useState<'windows' | 'macos'>('macos');

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
                            <Link to="/download" className="text-sm font-medium text-gray-600 hover:text-gray-900">
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
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Breadcrumb */}
                <nav className="text-sm text-gray-500 mb-8">
                    <Link to="/help" className="hover:text-gray-900">
                        Help
                    </Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-700">Clear Storage</span>
                </nav>

                {/* Title Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Clear Storage</h1>
                    <p className="text-lg text-gray-600">Reset all app data and settings.</p>
                </div>

                <hr className="border-gray-200 mb-8" />

                {/* Warning Banner */}
                <div className="border-l-4 border-yellow-400 bg-yellow-50 p-4 mb-12">
                    <p className="text-yellow-800">
                        This will remove all settings, saved configurations, and cached data. You'll need to reconfigure the app after.
                    </p>
                </div>

                {/* Step 1 */}
                <div className="mb-12">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            1
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Close Co-Interview</h3>
                            <p className="text-gray-600">Make sure the app is completely closed before proceeding.</p>
                        </div>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="mb-12">
                    <div className="flex items-start gap-4 mb-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            2
                        </div>
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete the storage folder</h3>

                            {/* OS Tabs */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setSelectedOS('windows')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        selectedOS === 'windows' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    Windows
                                </button>
                                <button
                                    onClick={() => setSelectedOS('macos')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        selectedOS === 'macos' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    macOS
                                </button>
                            </div>

                            <p className="text-gray-600 mb-3">{selectedOS === 'macos' ? 'Delete this folder:' : 'Delete these folders:'}</p>

                            <div className="bg-gray-100 rounded-lg p-4 font-mono text-sm text-gray-700">
                                {selectedOS === 'macos' ? (
                                    <code>~/Library/Application Support/co-interview</code>
                                ) : (
                                    <div className="space-y-2">
                                        <code className="block">C:\Users\&lt;YourUsername&gt;\AppData\Local\co-interview</code>
                                        <code className="block">C:\Users\&lt;YourUsername&gt;\AppData\Roaming\co-interview</code>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Step 3 */}
                <div className="mb-12">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                            3
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Restart the app</h3>
                            <p className="text-gray-600 mb-4">Launch Co-Interview again. You'll need to reconfigure:</p>
                            <ul className="list-disc list-inside text-gray-600 space-y-1 ml-1">
                                <li>API key</li>
                                <li>App settings</li>
                                <li>Window position</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white py-12 border-t border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Star on GitHub Button */}
                    <a
                        href="https://github.com/yongjiexue88/co-Interview"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors mb-8"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path
                                fillRule="evenodd"
                                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Star on GitHub
                    </a>

                    {/* Made by */}
                    <p className="text-sm text-gray-400">
                        Made by <span className="text-gray-600 underline">YX</span>
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default ClearStoragePage;

import React from 'react';

const SimpleFooter: React.FC = () => {
    return (
        <footer className="bg-white py-12 border-t border-gray-100">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                {/* Social Links - Removed */}

                {/* Made by */}
                <p className="text-sm text-gray-400">
                    Made by <span className="text-gray-600 underline">YX</span>
                </p>
            </div>
        </footer>
    );
};

export default SimpleFooter;

import React from 'react';

export const BlogHero: React.FC = () => {
    return (
        <section className="relative pt-32 pb-20 px-6 overflow-hidden max-w-[1200px] mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
                {/* Left Text */}
                <div className="flex-1 space-y-6 text-center md:text-left">
                    <h1 className="text-6xl md:text-8xl font-bold text-gray-200 tracking-tight">Blog</h1>

                    <p className="text-lg text-gray-400 max-w-lg leading-relaxed mx-auto md:mx-0">
                        Learn more about Co-Interview, and how we can double your salary by using AI to one-shot your Leetcode assessments and
                        interviews.
                    </p>
                </div>

                {/* Right Visual */}
                <div className="flex-1 flex justify-center md:justify-end">
                    <div className="relative w-64 h-64 md:w-80 md:h-80">
                        <div className="absolute inset-0 bg-gradient-to-br from-[#EFCC3A]/20 to-transparent rounded-3xl blur-3xl"></div>
                        <img
                            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1000&auto=format&fit=crop"
                            alt="Abstract 3D Shape"
                            className="relative w-full h-full object-cover rounded-3xl shadow-2xl opacity-90"
                            style={{ maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default BlogHero;

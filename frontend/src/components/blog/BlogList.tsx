import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Calendar, ArrowRight } from 'lucide-react';
import { MonthGroup, BlogPost, FeaturedPost as FeaturedPostType } from '../../content/blogTypes';

interface BlogListProps {
    groups: MonthGroup[];
    featuredPost?: FeaturedPostType;
}

const BlogList: React.FC<BlogListProps> = ({ groups, featuredPost }) => {
    return (
        <div className="max-w-7xl mx-auto px-6 pb-24">
            {/* Featured Post */}
            {featuredPost && (
                <div className="mb-16">
                    <article className="group relative">
                        <div className="block relative overflow-hidden rounded-3xl transition-all duration-500">
                            {/* Background Image */}
                            <div className="absolute inset-0 overflow-hidden rounded-3xl">
                                <img
                                    alt={featuredPost.title}
                                    loading="lazy"
                                    decoding="async"
                                    className="object-cover group-hover:scale-105 transition-transform duration-700 w-full h-full"
                                    src={featuredPost.imageUrl}
                                />
                            </div>
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent backdrop-blur-sm rounded-3xl"></div>

                            {/* Content */}
                            <div className="relative px-8 md:px-12 py-4 md:py-4 h-60 lg:h-72 xl:h-96 grid grid-rows-8 max-w-2xl">
                                {/* Date */}
                                <div className="row-span-2 flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4 text-[10px] sm:text-xs md:text-sm text-gray-200">
                                    <div className="flex items-center gap-1 md:gap-2">
                                        <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                                        <time>{featuredPost.date}</time>
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="row-span-4 flex flex-col space-y-4 md:space-y-6">
                                    <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white leading-tight">
                                        {featuredPost.title}
                                    </h3>
                                </div>

                                {/* CTA Button */}
                                <div className="row-span-2 flex items-center">
                                    <Link to={featuredPost.href}>
                                        <div className="inline-flex items-center gap-1 sm:gap-1.5 md:gap-2 lg:gap-3 px-2 sm:px-3 md:px-4 lg:px-6 py-1 sm:py-1.5 md:py-2 lg:py-3 bg-white text-black font-medium rounded-md shadow-lg hover:bg-gray-100 hover:shadow-xl transition-all duration-300 cursor-pointer">
                                            <span className="text-[10px] sm:text-xs md:text-sm lg:text-base">Read Full Article</span>
                                            <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </article>
                </div>
            )}

            {/* Blog List */}
            <div className="mb-16">
                <div className="relative">
                    {/* Desktop Layout */}
                    <div className="hidden lg:block">
                        {groups.map((group, groupIndex) => (
                            <div key={group.month} className="flex mb-12">
                                {/* Left Sidebar - Month Label & Timeline */}
                                <div className="flex-shrink-0 w-48 pr-8">
                                    <div className="flex flex-col items-center">
                                        <h1 className="text-xs lg:text-sm font-bold text-white uppercase tracking-wider mb-4">
                                            {group.month}
                                        </h1>
                                        <div className="w-0.5 bg-gray-600 flex-1"></div>
                                        <div
                                            className="w-[0.5px] bg-gray-600 mt-4"
                                            style={{ height: `${group.posts.length * 130}px` }}
                                        ></div>
                                    </div>
                                </div>

                                {/* Right Side - Articles */}
                                <div className="flex-1">
                                    <div className="space-y-12">
                                        {group.posts.map((post) => (
                                            <ArticleCard key={post.id} post={post} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile Layout */}
                    <div className="lg:hidden">
                        <div className="space-y-8">
                            {groups.flatMap(group => group.posts).map((post) => (
                                <MobileArticleCard key={post.id} post={post} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Desktop Article Card
const ArticleCard: React.FC<{ post: BlogPost }> = ({ post }) => {
    return (
        <article className="group">
            <Link
                className="flex items-start gap-6 py-4 hover:opacity-80 transition-opacity duration-300"
                to={post.href}
            >
                {/* Icon Box with Golden Gradient */}
                <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A]"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>
                    <div className="absolute top-0 left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>
                    <BookOpen className="w-8 h-8 text-black relative z-10" />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-white group-hover:text-[#FFFF00] transition-colors leading-tight mb-2">
                        {post.title}
                    </h3>
                    <div className="flex items-center gap-3 lg:gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <time>{post.date}</time>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
};

// Mobile Article Card
const MobileArticleCard: React.FC<{ post: BlogPost }> = ({ post }) => {
    return (
        <article className="group">
            <Link
                className="flex items-start gap-4 py-2 hover:opacity-80 transition-opacity duration-300"
                to={post.href}
            >
                {/* Icon Box with Golden Gradient */}
                <div className="flex-shrink-0 w-12 h-12 rounded-md flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#EFCC3A] to-[#EFB63A]"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-white/10 to-transparent"></div>
                    <div className="absolute top-0 left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full"></div>
                    <BookOpen className="w-8 h-8 text-black relative z-10" />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1">
                    <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-[#FFFF00] transition-colors leading-tight mb-2">
                        {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <time>{post.date}</time>
                        </div>
                    </div>
                </div>
            </Link>
        </article>
    );
};

export default BlogList;

import React from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { BlogPost } from '../../content/blogTypes';

interface FeaturedPostProps {
    post: BlogPost;
}

export const FeaturedPost: React.FC<FeaturedPostProps> = ({ post }) => {
    return (
        <div className="max-w-[1200px] mx-auto px-6 mb-24">
            <div className="relative aspect-[2/1] md:aspect-[2.5/1] rounded-3xl overflow-hidden group cursor-pointer">
                <img
                    src={post.coverImage}
                    alt={post.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                <div className="absolute bottom-0 left-0 p-8 md:p-12 max-w-3xl">
                    <div className="flex items-center gap-2 text-gray-300 text-sm font-medium mb-4">
                        <Calendar className="w-4 h-4" />
                        {post.date}
                    </div>

                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 leading-tight">{post.title}</h2>

                    <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-gray-100 transition-colors">
                        Read Full Article
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FeaturedPost;

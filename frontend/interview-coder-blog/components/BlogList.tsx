import React from 'react';
import { BookOpen, Calendar } from 'lucide-react';
import { MonthGroup } from '../types';

interface BlogListProps {
  groups: MonthGroup[];
}

export const BlogList: React.FC<BlogListProps> = ({ groups }) => {
  return (
    <div className="max-w-[1000px] mx-auto px-6 pb-32 relative">
      {/* Continuous Timeline Line */}
      {/* 
        Position Calculation:
        Desktop: Padding(24px) + Spacer(192px) + Gap(32px) + Half Icon(24px) = 272px
        Mobile: Padding(24px) + Half Icon(24px) = 48px
      */}
      <div className="absolute left-[48px] md:left-[272px] top-0 bottom-0 w-px bg-dark-border -z-10" />

      {groups.map((group) => (
        <div key={group.month + group.year} className="relative mb-16 last:mb-0">
          {/* Month Header */}
          <div className="flex gap-8 mb-8 items-center relative">
            {/* Desktop: Right aligned in the spacer column */}
            <div className="hidden md:block w-48 shrink-0 text-right">
              <span className="text-xs font-bold text-white tracking-widest uppercase">
                {group.month} {group.year}
              </span>
            </div>
            
            {/* Mobile: Just displayed above */}
            <div className="md:hidden ml-[60px]">
              <span className="text-xs font-bold text-white tracking-widest uppercase">
                {group.month} {group.year}
              </span>
            </div>
          </div>

          <div className="space-y-8">
            {group.posts.map((post) => (
              <a 
                key={post.id} 
                href={post.link}
                className="flex gap-8 group relative items-start"
              >
                {/* Desktop Spacer */}
                <div className="w-32 md:w-48 shrink-0 hidden md:block" />

                {/* Icon */}
                <div className="relative shrink-0 z-10">
                   <div className="w-12 h-12 rounded-xl bg-[#0A0A0A] border border-dark-border group-hover:border-brand-yellow/50 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(252,211,77,0.15)]">
                     <BookOpen className="w-5 h-5 text-brand-yellow" />
                   </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-1">
                  <h3 className="text-lg font-bold text-gray-100 mb-2 group-hover:text-brand-yellow transition-colors leading-tight">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
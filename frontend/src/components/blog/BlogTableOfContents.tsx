import React, { useEffect, useState } from 'react';
import { Heading } from '../../content/blogLoader';

interface BlogTableOfContentsProps {
    headings: Heading[];
}

const BlogTableOfContents: React.FC<BlogTableOfContentsProps> = ({ headings }) => {
    const [activeId, setActiveId] = useState<string>('');

    useEffect(() => {
        const handleScroll = () => {
            // Find which heading is currently in view
            const headingElements = headings.map(h => document.getElementById(h.id)).filter(Boolean);

            let currentActive = '';
            const scrollPosition = window.scrollY + 120; // Offset for header

            for (const element of headingElements) {
                if (element && element.offsetTop <= scrollPosition) {
                    currentActive = element.id;
                }
            }

            setActiveId(currentActive);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Initial calculation

        return () => window.removeEventListener('scroll', handleScroll);
    }, [headings]);

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        e.preventDefault();
        const element = document.getElementById(id);
        if (element) {
            const offset = 80; // Account for sticky header
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    };

    if (headings.length === 0) {
        return null;
    }

    return (
        <nav className="border-t border-white/10 pt-4">
            <h3 className="text-sm font-semibold text-white mb-3">On This Page</h3>
            <ul className="space-y-2">
                {headings.map((heading) => (
                    <li
                        key={heading.id}
                        style={{ paddingLeft: heading.level === 3 ? '12px' : '0' }}
                    >
                        <a
                            href={`#${heading.id}`}
                            onClick={(e) => handleClick(e, heading.id)}
                            className={`block text-sm leading-relaxed transition-colors duration-150 ${activeId === heading.id
                                    ? 'text-teal-400 font-medium'
                                    : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {heading.text}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export default BlogTableOfContents;

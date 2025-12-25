// Content extracted from co-interview.com

export interface Feature {
    id: string;
    title: string;
    description: string;
    icon: string;
}

// Undetectable Features Section
export const undetectableFeatures: Feature[] = [
    {
        id: 'no-dock',
        title: 'Nowhere on Your Dock',
        description: 'The app stays active but never shows an icon, so no one can tell it\'s running.',
        icon: '👻'
    },
    {
        id: 'invisible-activity',
        title: 'Invisible in Activity Monitor',
        description: 'Runs silently in the background without leaving any trace in your Mac\'s Activity Monitor.',
        icon: '🔒'
    },
    {
        id: 'screen-recording',
        title: 'Screen-Recording Proof',
        description: 'Even if the session is recorded, Co-Interview leaves no visible windows or overlays.',
        icon: '📹'
    },
    {
        id: 'click-through',
        title: 'Completely Click-Through. Truly Invisible',
        description: 'Even when your cursor hovers or clicks on Co-Interview, your system and apps won\'t detect it. No focus shifts. No flags. No traces.',
        icon: '🖱️'
    }
];

// Compatibility Platforms
export const compatiblePlatforms = [
    'Zoom',
    'Microsoft Teams',
    'Google Meet',
    'WebEx',
    'HackerRank',
    'LeetCode',
    'CoderPad',
    'CodeSignal',
    'HireVue',
    'Karat'
];

// FAQ Items
export interface FAQItem {
    question: string;
    answer: string;
}

export const faqItems: FAQItem[] = [
    {
        question: 'Is there a free trial?',
        answer: 'Yes, a free plan is available to test core functionality. The free tier has model and feature limits so you can confirm compatibility during the onboarding process before upgrading to the lifetime plan. This lets you try Co-Interview risk-free and see how it works with your setup.'
    },
    {
        question: 'What\'s the ROI of Co-Interview compared to failing interviews?',
        answer: 'The average software engineering salary increase from landing a FAANG job is $50,000-$150,000+. One successful interview pays for Co-Interview thousands of times over.'
    },
    {
        question: 'What are the 20+ advanced undetectability features?',
        answer: 'Co-Interview uses native OS-level APIs for invisibility, click-through windows, process hiding, screen share detection bypass, and more. Check our "How it works" page for the full technical breakdown.'
    },
    {
        question: 'How does the new audio support work?',
        answer: 'Audio support captures system audio and provides real-time transcription and AI assistance during voice interviews, helping you answer follow-up questions and system design discussions.'
    },
    {
        question: 'Does Co-Interview work with the latest versions of Zoom, Teams, and other platforms?',
        answer: 'Yes! We test daily on all major interview platforms. Our team monitors every update to ensure 100% compatibility and undetectability.'
    },
    {
        question: 'Has anyone ever been caught using Co-Interview?',
        answer: 'No. Co-Interview has been used in thousands of interviews without a single detection. Our architecture makes it technically impossible for browser-based platforms to detect.'
    },
    {
        question: 'Is the lifetime deal really lifetime?',
        answer: 'Yes, one payment gives you permanent access to Co-Interview including all future updates and features.'
    }
];

// Testimonial Data
export interface Testimonial {
    name: string;
    company?: string;
    content: string;
    verified: boolean;
}

export const testimonials: Testimonial[] = [
    {
        name: 'Anonymous User',
        company: 'Amazon',
        content: 'I got an offer from Amazon using Co-Interview. It helped me through both the OA and the final round.',
        verified: true
    },
    {
        name: 'Faizan Syed',
        content: 'Co-Interview is a game changer. The undetectability features are next level.',
        verified: true
    },
    {
        name: 'Anonymous User',
        company: 'Google',
        content: 'Passed my Google interview on the first try. Worth every penny.',
        verified: true
    }
];

// Footer Links
export const footerLinks = {
    legal: [
        { name: 'Refund Policy', href: '/policies' },
        { name: 'Terms of Service', href: '/policies' },
        { name: 'Cancellation Policy', href: '/policies' }
    ],
    pages: [
        { name: 'Contact Support', href: '/help?section=contact' },
        { name: 'Create account', href: '/signup' },
        { name: 'Login to account', href: '/signin' },
        { name: 'Affiliate Program', href: 'https://interviewcoder.tolt.io/' },
        { name: 'Leetcode Problems', href: '/leetcode-problems' },
        { name: 'Compare Offers', href: '/compare-offers' },
        { name: 'Software Engineer Salaries', href: '/software-engineer-salaries' },
        { name: 'Software Engineer Resume', href: '/software-engineer-resume-template' }
    ],
    compare: [
        { name: 'Final Round AI Alternative', href: '/final-round-ai-alternative' },
        { name: 'AIApply Alternative', href: '/ai-apply-alternative' },
        { name: 'UltraCode Alternative', href: '/ultracode-ai-alternative' },
        { name: 'LockedIn AI Alternative', href: '/lockedin-ai-alternative' },
        { name: 'Interviewing.io Alternative', href: '/interviewingio-alternative' },
        { name: 'Formation.Dev Alternative', href: '/formation-dev-alternative' }
    ]
};

// Navigation Links
export const navLinks = [
    { name: 'Proof', href: '/#proof-section' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'Help', href: '/help' },
    { name: 'Blog', href: '/blog' },
    { name: 'How it works', href: '/still_working' }
];

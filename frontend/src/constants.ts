import { Shield, Zap, Code2, Globe, Layout, Cpu } from 'lucide-react';
import { Feature, PricingPlan, FaqItem } from './types';

export const FEATURES: Feature[] = [
    {
        title: 'Undetectable',
        description:
            'Designed with stealth in mind. Our overlay captures screen content without injecting code into the webpage DOM, making it virtually impossible for anti-cheat systems to detect.',
        icon: Shield,
    },
    {
        title: 'Supports All Sites',
        description:
            'Works seamlessly on LeetCode, HackerRank, CodeSignal, CodeWars, and any other web-based coding environment or interview platform.',
        icon: Globe,
    },
    {
        title: 'Instant Solutions',
        description: 'Get optimized solutions with time and space complexity analysis in seconds. Supports Python, Java, C++, JavaScript, and more.',
        icon: Zap,
    },
    {
        title: 'Keyboard Shortcuts',
        description: 'Trigger the AI discreetly using customizable keyboard shortcuts. Keep your hands on the keyboard and maintain your flow.',
        icon: Layout,
    },
    {
        title: 'Multi-Model Support',
        description: 'Choose between GPT-4o, Claude 3.5 Sonnet, and Gemini Pro to get the best possible answer for your specific problem type.',
        icon: Cpu,
    },
    {
        title: 'Code Explanation',
        description:
            "Don't just copy—understand. The AI explains the logic behind the solution so you can confidently explain it to your interviewer.",
        icon: Code2,
    },
];

export const PRICING_PLANS: PricingPlan[] = [
    {
        name: 'Starter',
        price: 'Free',
        features: ['5 AI solutions per day', 'Basic explanation', 'Support for LeetCode', 'Community support'],
        buttonText: 'Get Started',
    },
    {
        name: 'Pro',
        price: '$19',
        period: '/month',
        recommended: true,
        features: [
            'Unlimited AI solutions',
            'Advanced stealth mode',
            'Support for all platforms',
            'GPT-4o & Claude 3.5',
            'Priority support',
            'Screenshot analysis',
        ],
        buttonText: 'Upgrade to Pro',
    },
    {
        name: 'Lifetime',
        price: '$149',
        period: ' one-time',
        features: ['Everything in Pro', 'One-time payment', 'Lifetime updates', 'Early access to new features', 'Exclusive Discord role'],
        buttonText: 'Get Lifetime Access',
    },
];

export const FAQS: FaqItem[] = [
    {
        question: 'Is this detectable by interview platforms?',
        answer: "We use a unique visual-analysis approach that does not inject code into the website's DOM. This makes it extremely difficult for standard anti-cheat mechanisms on platforms like HackerRank or CodeSignal to detect the extension.",
    },
    {
        question: 'Does it work with screen sharing?',
        answer: "The extension overlay is drawn directly on your browser view. If you share your 'Entire Screen', it may be visible. However, if you share only the browser window or tab, most screen sharing software will capture it. We recommend testing with a friend first.",
    },
    {
        question: 'Which languages are supported?',
        answer: 'We support all major programming languages used in technical interviews, including Python, Java, C++, JavaScript, TypeScript, Go, Ruby, Swift, and Rust.',
    },
    {
        question: 'Can I use my own API key?',
        answer: 'Yes! In the settings, you can provide your own OpenAI or Anthropic API key to pay for usage directly and bypass our rate limits.',
    },
];

export const ADMIN_EMAILS = ['yongjiexue88@gmail.com', 'xue515953749@gmail.com'];

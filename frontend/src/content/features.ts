export interface Feature {
    id: string;
    title: string;
    description: string;
    icon: string;
    category: 'stealth' | 'ai' | 'integration';
}

export const features: Feature[] = [
    {
        id: 'invisible-dock',
        title: 'Invisible on Dock',
        description: 'Completely hidden from macOS Dock and Windows taskbar. Zero visual footprint.',
        icon: '👻',
        category: 'stealth'
    },
    {
        id: 'screen-detection',
        title: 'Screen Share Detection',
        description: 'Auto-hides when screen sharing is detected. Works with Zoom, Teams, Meet.',
        icon: '🛡️',
        category: 'stealth'
    },
    {
        id: 'ai-solutions',
        title: 'AI-Powered Solutions',
        description: 'Get instant solutions to LeetCode, HackerRank, and custom problems.',
        icon: '🤖',
        category: 'ai'
    },
    {
        id: 'audio-support',
        title: 'Audio Interview Support',
        description: 'Real-time transcription and AI assistance during voice interviews.',
        icon: '🎙️',
        category: 'ai'
    },
    {
        id: 'browser-integration',
        title: 'Browser Integration',
        description: 'Works seamlessly with Chrome, Firefox, Safari, and Edge.',
        icon: '🌐',
        category: 'integration'
    },
    {
        id: 'hotkey-control',
        title: 'Hotkey Control',
        description: 'Instant show/hide with customizable keyboard shortcuts.',
        icon: '⌨️',
        category: 'integration'
    }
];

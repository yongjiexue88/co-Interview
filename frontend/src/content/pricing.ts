export interface PricingTier {
    id: string;
    name: string;
    price: number;
    period: 'month' | 'year' | 'lifetime';
    description: string;
    features: string[];
    popular?: boolean;
}

export const pricingTiers: PricingTier[] = [
    {
        id: 'free',
        name: 'Free Trial',
        price: 0,
        period: 'month',
        description: 'Try all features for 7 days',
        features: [
            '7-day full access',
            'All stealth features',
            'AI-powered solutions',
            'Email support'
        ]
    },
    {
        id: 'monthly',
        name: 'Monthly',
        price: 29,
        period: 'month',
        description: 'Perfect for interview prep',
        features: [
            'Unlimited AI solutions',
            'All stealth features',
            'Audio interview support',
            'Priority support',
            'Regular updates'
        ],
        popular: true
    },
    {
        id: 'lifetime',
        name: 'Lifetime',
        price: 199,
        period: 'lifetime',
        description: 'One-time payment, forever access',
        features: [
            'Everything in Monthly',
            'Lifetime updates',
            'Early access to new features',
            'VIP support',
            'No recurring fees'
        ]
    }
];

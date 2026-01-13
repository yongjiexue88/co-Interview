export interface PricingTier {
    id: string;
    name: string;
    price: number;
    period: 'free' | '30-days' | 'lifetime';
    description: string;
    features: string[];
    popular?: boolean;
    paymentLink?: string;
    comingSoon?: boolean;
}

export const pricingTiers: PricingTier[] = [
    {
        id: 'free',
        name: 'Free Trial',
        price: 0,
        period: 'free',
        description: 'Try before you buy',
        features: ['3 Interview Sessions', 'Basic AI Support', 'Screen Analysis Only', 'Community Support'],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        period: '30-days',
        description: '30 days of managed access',
        features: ['Unlimited Interview Support', 'Real-time Audio & Screen Analysis', 'All Languages Supported', 'Undetectable Mode'],
        popular: true,
        // paymentLink removed in favor of direct API integration
    },
    {
        id: 'lifetime',
        name: 'Lifetime',
        price: 99,
        period: 'lifetime',
        description: 'One-time payment, forever access',
        features: ['Everything in Interview Sprint', 'Priority Support', 'New Features Early Access', 'Lifetime Updates', 'No recurring fees'],
    },
];

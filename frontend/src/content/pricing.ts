export interface PricingTier {
    id: string;
    name: string;
    price: number;
    period: 'free' | '14-days' | 'lifetime';
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
        name: '14-Day Interview Pass',
        price: 19.99,
        period: '14-days',
        description: 'Everything you need for your next interview',
        features: ['Unlimited Interview Support', 'Real-time Audio & Screen Analysis', 'All Languages Supported', 'Undetectable Mode'],
        popular: true,
        // paymentLink removed in favor of direct API integration
    },
    {
        id: 'lifetime',
        name: 'Lifetime Access',
        price: 99,
        period: 'lifetime',
        description: 'Never stress about interviews again. Ever.',
        features: ['Everything in Pro', 'Priority Support', 'New Features Early Access', 'Lifetime Updates', 'No recurring fees'],
    },
];

import { PricingTier } from '../content/pricing';
import { FAQItem } from '../content/siteContent';

export const generateOrganizationSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Co-Interview',
    url: 'https://co-interview.com',
    logo: 'https://co-interview.com/logo.png', // Update with actual logo path if available
});

export const generateWebSiteSchema = () => ({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Co-Interview',
    url: 'https://co-interview.com',
    potentialAction: {
        '@type': 'SearchAction',
        target: 'https://co-interview.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
    },
});

export const generateProductSchema = (pricing: PricingTier[]) => {
    // Determine low and high price
    const prices = pricing.map(p => p.price);
    const lowPrice = Math.min(...prices);
    const highPrice = Math.max(...prices);

    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: 'Co-Interview AI Assistant',
        description: 'Undetectable AI interview copilot for technical interviews.',
        image: 'https://co-interview.com/og-image.png',
        brand: {
            '@type': 'Brand',
            name: 'Co-Interview',
        },
        offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'USD',
            lowPrice: lowPrice,
            highPrice: highPrice,
            offerCount: pricing.length,
        },
    };
};

export const generateFAQSchema = (faqs: FAQItem[]) => ({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
            '@type': 'Answer',
            text: faq.answer,
        },
    })),
});

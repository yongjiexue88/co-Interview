import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonicalUrl: string;
    type?: string;
    name?: string;
    jsonLd?: Record<string, any>[];
    keywords?: string[];
    image?: string;
    robots?: string;
}

const SEO: React.FC<SEOProps> = ({
    title,
    description,
    canonicalUrl,
    type = 'website',
    name = 'Co-Interview',
    jsonLd,
    keywords,
    image,
    robots = 'index, follow'
}) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />
            {keywords && <meta name="keywords" content={keywords.join(', ')} />}
            <meta name="robots" content={robots} />

            {/* End of standard metadata tags */}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            {image && <meta property="og:image" content={image} />}
            {/* End of Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            {image && <meta name="twitter:image" content={image} />}
            {/* End of Twitter tags */}

            {/* Schema.org JSON-LD */}
            {jsonLd &&
                jsonLd.map((schema, index) => (
                    <script key={index} type="application/ld+json">
                        {JSON.stringify(schema)}
                    </script>
                ))}
        </Helmet>
    );
};

export default SEO;

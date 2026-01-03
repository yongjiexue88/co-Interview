import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonicalUrl: string;
    type?: string;
    name?: string;
    jsonLd?: Record<string, any>[];
}

const SEO: React.FC<SEOProps> = ({ title, description, canonicalUrl, type = 'website', name = 'Co-Interview', jsonLd }) => {
    return (
        <Helmet>
            {/* Standard metadata tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* End of standard metadata tags */}

            {/* Facebook tags */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            {/* End of Facebook tags */}

            {/* Twitter tags */}
            <meta name="twitter:creator" content={name} />
            <meta name="twitter:card" content={type} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
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

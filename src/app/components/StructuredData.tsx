"use client";

import Script from "next/script";

// Structured Data for SEO (JSON-LD)
const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "JSON Formatter",
    "alternateName": "JSONFormat.info",
    "url": "https://jsonformat.info/",
    "description": "Ücretsiz JSON formatter ve validator aracı. JSON verilerinizi düzenleyin, doğrulayın ve güzelleştirin.",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "browserRequirements": "Requires JavaScript. Requires HTML5.",
    "softwareVersion": "2.0",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "featureList": [
        "JSON Formatting",
        "JSON Validation",
        "JSON Minification",
        "JSON Beautification",
        "Syntax Highlighting",
        "Tree View",
        "Dark Mode",
        "Multiple Languages"
    ],
    "screenshot": "https://jsonformat.info/screenshot/desktop-1280x720.png",
    "author": {
        "@type": "Organization",
        "name": "JSONFormat.info",
        "url": "https://jsonformat.info/"
    },
    "publisher": {
        "@type": "Organization",
        "name": "JSONFormat.info",
        "url": "https://jsonformat.info/"
    },
    "inLanguage": ["tr", "en", "de", "fr", "it"],
    "isAccessibleForFree": true,
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.8",
        "ratingCount": "150",
        "bestRating": "5",
        "worstRating": "1"
    }
};

// Organization Schema
const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "JSONFormat.info",
    "url": "https://jsonformat.info/",
    "logo": "https://jsonformat.info/icons/icon-512x512.png",
    "sameAs": [
        "https://twitter.com/jsonformat"
    ]
};

// BreadcrumbList for navigation
const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
        {
            "@type": "ListItem",
            "position": 1,
            "name": "Ana Sayfa",
            "item": "https://jsonformat.info/"
        }
    ]
};

export default function StructuredData() {
    return (
        <>
            <Script
                id="structured-data-webapp"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData)
                }}
            />
            <Script
                id="structured-data-organization"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationData)
                }}
            />
            <Script
                id="structured-data-breadcrumb"
                type="application/ld+json"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbData)
                }}
            />
        </>
    );
}

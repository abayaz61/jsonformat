"use client";

import Script from "next/script";

// ── WebApplication Schema ─────────────────────────────────────────────────
const webAppSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "JSON Formatter",
  "alternateName": ["JSONFormat.info", "JSON SQL Query Tool", "JSON Editor Online"],
  "url": "https://jsonformat.info/",
  "description":
    "Free online JSON formatter, validator and SQL query tool. Format, beautify, minify and validate JSON. Query JSON data with SQL — SELECT, WHERE, GROUP BY, ORDER BY. Tree view, syntax highlighting, 6 languages.",
  "applicationCategory": "DeveloperApplication",
  "applicationSubCategory": "Productivity",
  "operatingSystem": "Any",
  "browserRequirements": "Requires JavaScript. Requires HTML5.",
  "softwareVersion": "3.0",
  "datePublished": "2024-01-01",
  "dateModified": "2025-04-02",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
  },
  "featureList": [
    // Core JSON features
    "JSON Formatting & Beautification",
    "JSON Validation & Error Detection",
    "JSON Minification",
    "JSON Syntax Highlighting",
    "JSON Tree View",
    // NEW: SQL Query feature
    "SQL Query on JSON Data",
    "JSON Filtering with WHERE clause",
    "JSON Sorting with ORDER BY",
    "JSON Grouping with GROUP BY",
    "JSON Table View",
    "JSON Raw Result View",
    "Query History",
    // General
    "20 Color Themes",
    "Dark Mode & Light Mode",
    "6 Language Support (EN, TR, DE, FR, IT, ZH)",
    "PWA — Works Offline",
    "Desktop App (Windows, macOS, Linux via Tauri)",
    "File Import & Export",
    "Clipboard Support",
    "Auto Format on Paste",
  ],
  "screenshot": [
    {
      "@type": "ImageObject",
      "url": "https://jsonformat.info/screenshot/desktop-1280x720.png",
      "caption": "JSON Formatter — SQL Query Tab",
    },
  ],
  "author": {
    "@type": "Organization",
    "name": "JSONFormat.info",
    "url": "https://jsonformat.info/",
  },
  "publisher": {
    "@type": "Organization",
    "name": "JSONFormat.info",
    "url": "https://jsonformat.info/",
    "logo": {
      "@type": "ImageObject",
      "url": "https://jsonformat.info/icons/icon-512x512.png",
    },
  },
  "inLanguage": ["en", "tr", "de", "fr", "it", "zh"],
  "isAccessibleForFree": true,
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "250",
    "bestRating": "5",
    "worstRating": "1",
  },
};

// ── Organization Schema ───────────────────────────────────────────────────
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "JSONFormat.info",
  "url": "https://jsonformat.info/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://jsonformat.info/icons/icon-512x512.png",
    "width": 512,
    "height": 512,
  },
  "sameAs": [
    "https://twitter.com/jsonformat",
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer support",
    "availableLanguage": ["English", "Turkish", "German", "French", "Italian", "Chinese"],
  },
};

// ── FAQPage Schema — boosts rich snippets in SERPs ────────────────────────
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is JSON Formatter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON Formatter is a free online tool to format, validate, beautify and minify JSON data. It also includes a SQL query tab letting you filter and explore JSON with SQL syntax (SELECT, WHERE, ORDER BY, GROUP BY).",
      },
    },
    {
      "@type": "Question",
      "name": "Can I query JSON data with SQL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes! JSONFormat.info has a built-in SQL Query tab powered by AlaSQL. You can write SQL queries like SELECT * FROM ? WHERE age > 20 ORDER BY name to filter and explore your JSON data instantly.",
      },
    },
    {
      "@type": "Question",
      "name": "Is JSON Formatter free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, JSONFormat.info is completely free to use. No sign-up required. All processing happens in your browser — your data never leaves your device.",
      },
    },
    {
      "@type": "Question",
      "name": "What languages does JSON Formatter support?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JSON Formatter supports 6 languages: English, Turkish (Türkçe), German (Deutsch), French (Français), Italian (Italiano), and Chinese (中文).",
      },
    },
    {
      "@type": "Question",
      "name": "Does JSON Formatter work offline?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. JSONFormat.info is a Progressive Web App (PWA) and can be installed on your device. Once installed it works fully offline. A desktop app is also available for Windows, macOS, and Linux.",
      },
    },
    {
      "@type": "Question",
      "name": "How do I format messy JSON?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Paste your JSON into the editor and click the Format button (or press Ctrl+Shift+F). The editor will automatically format, indent and highlight your JSON with proper syntax colors.",
      },
    },
  ],
};

// ── BreadcrumbList ────────────────────────────────────────────────────────
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "JSON Formatter",
      "item": "https://jsonformat.info/",
    },
  ],
};

// ── SoftwareApplication (for app stores / discovery) ─────────────────────
const softwareAppSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "JSON Formatter",
  "operatingSystem": "Windows, macOS, Linux, Web",
  "applicationCategory": "DeveloperApplication",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "250",
  },
};

export default function StructuredData() {
  return (
    <>
      <Script
        id="sd-webapp"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <Script
        id="sd-organization"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="sd-faq"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Script
        id="sd-breadcrumb"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="sd-software"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
      />
    </>
  );
}

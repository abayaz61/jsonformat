"use client";

import Script from "next/script";

export default function GoogleAnalytics() {
    return (
        <>
            <Script
                async
                src="https://www.googletagmanager.com/gtag/js?id=G-J43L67FJFY"
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-J43L67FJFY', {
            page_title: 'JSON Formatter - Ana Sayfa',
            page_location: 'https://jsonformat.info/',
            content_group1: 'JSON Tools',
            content_group2: 'Formatter'
          });
        `}
            </Script>
        </>
    );
}

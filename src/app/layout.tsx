import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, LanguageProvider, SettingsProvider } from "@/contexts";
import "./globals.css";
import UpdateNotification from "@/app/components/UpdateNotification";
import InstallPrompt from "@/app/components/InstallPrompt";
import PrivacyNotice from "@/app/components/PrivacyNotice";
import WelcomePopup from "@/app/components/WelcomePopup";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import StructuredData from "@/app/components/StructuredData";
import TauriWindowManager from "@/app/components/TauriWindowManager";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // ── Primary Meta Tags ────────────────────────────────────────────
  title: "JSON Formatter & SQL Query Tool — Format, Validate, Query JSON Online | jsonformat.info",
  description:
    "Free online JSON formatter, validator and SQL query tool. Format, beautify, minify and validate JSON. Query and filter JSON data with SQL — SELECT, WHERE, GROUP BY, ORDER BY. Supports 6 languages. Fast, secure, works in browser.",
  keywords: [
    // Core tool
    "json formatter", "json validator", "json beautifier", "json minifier",
    "json parser", "json editor", "json viewer", "json pretty print",
    // NEW: SQL query feature
    "json sql query", "query json data", "json filter", "json search",
    "sql json online", "json select where", "json data explorer",
    "json to table", "alasql json", "json query tool",
    // Turkish
    "json düzenleyici", "json doğrulayıcı", "json sorgulama",
    "json filtreleme", "json sql sorgusu", "ücretsiz json araç",
    // German
    "json formatieren", "json validator deutsch", "json abfrage",
    // French
    "formateur json", "validateur json", "requête json sql",
    // Italian
    "formattatore json", "validatore json", "interrogazione json",
    // Chinese
    "json格式化", "json验证", "json查询",
    // Developer terms
    "online json tool", "free json tool", "json api response formatter",
    "json syntax highlighting", "json tree view", "developer tools",
  ],
  authors: [{ name: "JSONFormat.info", url: "https://jsonformat.info" }],
  creator: "JSONFormat.info",
  publisher: "JSONFormat.info",
  applicationName: "JSON Formatter",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",

  // ── Apple Web App ─────────────────────────────────────────────────
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JSON Formatter",
  },
  formatDetection: { telephone: false },

  // ── Open Graph / Facebook ────────────────────────────────────────
  openGraph: {
    type: "website",
    url: "https://jsonformat.info/",
    title: "JSON Formatter & SQL Query Tool — Free Online JSON Editor",
    description:
      "Format, validate and beautify JSON. Query JSON data with SQL (SELECT, WHERE, ORDER BY). Tree view, syntax highlighting, 6 languages. Free & fast — no sign-up needed.",
    siteName: "JSONFormat.info",
    locale: "en_US",
    alternateLocale: ["tr_TR", "de_DE", "fr_FR", "it_IT", "zh_CN"],
    images: [
      {
        url: "https://jsonformat.info/screenshot/desktop-1280x720.png",
        width: 1200,
        height: 630,
        alt: "JSON Formatter — Format, Validate & Query JSON with SQL",
        type: "image/png",
      },
    ],
  },

  // ── Twitter Card ─────────────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    title: "JSON Formatter & SQL Query Tool — Free Online",
    description:
      "Format & validate JSON. Query JSON data with SQL. Tree view, syntax highlighting, 6 languages. Free & instant.",
    site: "@jsonformat",
    creator: "@jsonformat",
    images: ["https://jsonformat.info/screenshot/desktop-1280x720.png"],
  },

  // ── Hreflang / Alternate Languages ───────────────────────────────
  alternates: {
    canonical: "https://jsonformat.info/",
    languages: {
      "x-default": "https://jsonformat.info/",
      "en":        "https://jsonformat.info/?lang=en",
      "tr":        "https://jsonformat.info/?lang=tr",
      "de":        "https://jsonformat.info/?lang=de",
      "fr":        "https://jsonformat.info/?lang=fr",
      "it":        "https://jsonformat.info/?lang=it",
      "zh-Hans":   "https://jsonformat.info/?lang=zh",
    },
  },

  // ── Search Engine Verification ───────────────────────────────────
  verification: {
    google: "nEMYj6IA_R51LxQf2T2PNpOP3y3Zd5ed0n9lWchWgnw",
    yandex: "96fde976efba257c",
    other: {
      "msvalidate.01": "37862A76E0EE2715ACCDC16AE71DD942",
    },
  },

  // ── Additional Meta ───────────────────────────────────────────────
  other: {
    "revisit-after":  "7 days",
    "copyright":      "© 2025 JSONFormat.info",
    // Geo targeting — serve global audience
    "geo.region":     "TR",
    "geo.placename":  "Turkey",
    "DC.language":    "en, tr, de, fr, it, zh",
    "DC.title":       "JSON Formatter & SQL Query Tool",
    "DC.description": "Free online JSON formatter, validator and SQL query tool.",
    "DC.creator":     "JSONFormat.info",
    "DC.rights":      "© 2025 JSONFormat.info. All rights reserved.",
    "rating":         "general",
    "category":       "developer tools",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#667eea",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" data-theme="dark" data-color="ocean" suppressHydrationWarning>
      <head>
        {/* DNS Prefetch & Preconnect for faster loading */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />

        {/* Monaco Editor CDN - Critical for fast editor loading */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//cdn.jsdelivr.net" />

        {/* Development SW Cleanup */}
        {process.env.NODE_ENV === "development" && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                    }
                  });
                }
              `,
            }}
          />
        )}

        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <TauriWindowManager />
        <SettingsProvider>
          <ThemeProvider>
            <LanguageProvider>
              {children}
              <UpdateNotification />
              <InstallPrompt />
              <PrivacyNotice />
              <WelcomePopup />
            </LanguageProvider>
          </ThemeProvider>
        </SettingsProvider>
        <GoogleAnalytics />
        <StructuredData />
      </body>
    </html>
  );
}

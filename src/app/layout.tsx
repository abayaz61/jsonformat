import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider, LanguageProvider, SettingsProvider } from "@/contexts";
import "./globals.css";
import UpdateNotification from "@/app/components/UpdateNotification";
import InstallPrompt from "@/app/components/InstallPrompt";
import PrivacyNotice from "@/app/components/PrivacyNotice";
import GoogleAnalytics from "@/app/components/GoogleAnalytics";
import StructuredData from "@/app/components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Primary Meta Tags (Turkish)
  title: "JSON Formatter - JSON Düzenleme Aracı | jsonformat.info",
  description:
    "Ücretsiz JSON formatter ve validator aracı. JSON verilerinizi düzenleyin, doğrulayın ve güzelleştirin. Hızlı, güvenli ve kullanıcı dostu online JSON düzenleyici.",
  keywords: [
    "json formatter",
    "json düzenleyici",
    "json validator",
    "json doğrulayıcı",
    "json beautifier",
    "json parser",
    "online json araç",
    "ücretsiz json formatter",
    "json minify",
  ],
  authors: [{ name: "JSONFormat.info" }],
  creator: "JSONFormat.info",
  publisher: "JSONFormat.info",
  applicationName: "JSON Formatter",
  robots: "index, follow",
  manifest: "/manifest.json",

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "JSON Formatter",
  },
  formatDetection: {
    telephone: false,
  },

  // Open Graph / Facebook
  openGraph: {
    type: "website",
    url: "https://jsonformat.info/",
    title: "JSON Formatter - JSON Düzenleyici ve Doğrulayıcı",
    description:
      "Ücretsiz JSON formatter ve validator aracı. JSON verilerinizi düzenleyin, doğrulayın ve güzelleştirin.",
    siteName: "JSONFormat.info",
    locale: "tr_TR",
    images: [
      {
        url: "https://jsonformat.info/screenshot/desktop-1280x720.png",
        width: 1200,
        height: 630,
        alt: "JSON Formatter Screenshot",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "JSON Formatter - JSON Düzenleyici ve Doğrulayıcı",
    description:
      "Ücretsiz JSON formatter ve validator aracı. JSON verilerinizi düzenleyin, doğrulayın ve güzelleştirin.",
    site: "@jsonformat",
    creator: "@jsonformat",
    images: ["https://jsonformat.info/screenshot/desktop-1280x720.png"],
  },

  // Alternate Languages
  alternates: {
    canonical: "https://jsonformat.info/",
    languages: {
      "tr": "https://jsonformat.info/?lang=tr",
      "en": "https://jsonformat.info/?lang=en",
      "x-default": "https://jsonformat.info/",
    },
  },

  // Search Engine Verification
  verification: {
    google: "nEMYj6IA_R51LxQf2T2PNpOP3y3Zd5ed0n9lWchWgnw",
    yandex: "96fde976efba257c",
    other: {
      "msvalidate.01": "37862A76E0EE2715ACCDC16AE71DD942",
    },
  },

  // Additional Meta
  other: {
    "revisit-after": "7 days",
    "copyright": "© 2024 JSONFormat.info",
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
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />

        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <SettingsProvider>
          <ThemeProvider>
            <LanguageProvider>
              {children}
              <UpdateNotification />
              <InstallPrompt />
              <PrivacyNotice />
            </LanguageProvider>
          </ThemeProvider>
        </SettingsProvider>
        <GoogleAnalytics />
        <StructuredData />
      </body>
    </html>
  );
}

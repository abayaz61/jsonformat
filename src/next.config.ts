
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import packageJson from "./package.json";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "export", // Static HTML export için gerekli
  trailingSlash: true, // SEO ve static hosting uyumluluğu için
  images: {
    unoptimized: true, // Static export için image optimization kapatılmalı
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
};

export default withSerwist(nextConfig);

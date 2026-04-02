
import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import packageJson from "./package.json";
import path from "path";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_APP_VERSION: packageJson.version,
  },
  webpack: (config) => {
    // AlaSQL's default entry (alasql.fs.js) requires react-native modules.
    // Force webpack to use the browser-only bundle instead.
    config.resolve.alias = {
      ...config.resolve.alias,
      'alasql': path.resolve(__dirname, 'node_modules/alasql/dist/alasql.min.js'),
    };
    return config;
  },
};


export default withSerwist(nextConfig);

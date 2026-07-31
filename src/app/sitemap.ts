import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const CANONICAL_URL = "https://jsonformat.info/";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: CANONICAL_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}

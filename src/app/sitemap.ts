import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const BASE_URL = "https://jsonformat.info";

const LANGUAGE_ALTERNATES: Record<string, string> = {
  "x-default": `${BASE_URL}/`,
  en: `${BASE_URL}/?lang=en`,
  tr: `${BASE_URL}/?lang=tr`,
  de: `${BASE_URL}/?lang=de`,
  fr: `${BASE_URL}/?lang=fr`,
  it: `${BASE_URL}/?lang=it`,
  "zh-Hans": `${BASE_URL}/?lang=zh`,
};

const LANGUAGE_ENTRIES: Array<{ lang: string; priority: number }> = [
  { lang: "en", priority: 0.95 },
  { lang: "tr", priority: 0.95 },
  { lang: "de", priority: 0.85 },
  { lang: "fr", priority: 0.85 },
  { lang: "it", priority: 0.85 },
  { lang: "zh", priority: 0.85 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const rootEntry: MetadataRoute.Sitemap[number] = {
    url: `${BASE_URL}/`,
    lastModified,
    changeFrequency: "weekly",
    priority: 1,
    alternates: { languages: LANGUAGE_ALTERNATES },
  };

  const languageEntries: MetadataRoute.Sitemap = LANGUAGE_ENTRIES.map(
    ({ lang, priority }) => ({
      url: `${BASE_URL}/?lang=${lang}`,
      lastModified,
      changeFrequency: "weekly",
      priority,
      alternates: { languages: LANGUAGE_ALTERNATES },
    }),
  );

  return [rootEntry, ...languageEntries];
}

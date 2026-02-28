import type { MetadataRoute } from "next";

/**
 * /sitemap.xml — Next.js App Router sitemap
 *
 * Only the two genuinely public pages are listed. All user-specific, wallet-
 * gated, and admin pages are excluded to match the rules in public/robots.txt.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}

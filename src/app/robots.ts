import type { MetadataRoute } from "next";
import { resolveSiteUrl } from "@/lib/site-url";

// Required when `output: 'export'` is set in next.config.ts
export const dynamic = "force-static";

const SITE_URL = resolveSiteUrl();

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

const FALLBACK_SITE_URL = "https://10ax.github.io";

function ensureProtocol(url: string): string {
  if (/^https?:\/\//i.test(url)) return url;
  return `https://${url}`;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export function resolveSiteUrl(rawValue = process.env.NEXT_PUBLIC_SITE_URL): string {
  const raw = rawValue?.trim();
  if (!raw) return FALLBACK_SITE_URL;

  const candidate = ensureProtocol(raw);
  try {
    return stripTrailingSlash(new URL(candidate).toString());
  } catch {
    return FALLBACK_SITE_URL;
  }
}

export function getSiteUrlObject(): URL {
  return new URL(resolveSiteUrl());
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emit a fully static site under ./out/ — required for GitHub Pages.
  output: "export",
  // GitHub Pages serves files as-is, so generate trailing-slash directories
  // (e.g. /blog/welcome/index.html) for nicer hosting.
  trailingSlash: true,
  images: {
    // No Next.js image optimizer at runtime on Pages — serve sources as-is.
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "lastfm.freetls.fastly.net" },
      { protocol: "https", hostname: "*.lastfm.freetls.fastly.net" },
    ],
  },
};

export default nextConfig;

import type { NextConfig } from "next";

/** Extra hosts allowed to load `/_next/*` in dev (physical phones, etc.). Comma-separated. */
const extraDevOrigins = (process.env.FOLIO_ALLOWED_DEV_ORIGINS ?? "")
  .split(/[\s,]+/)
  .map((h) => h.trim())
  .filter(Boolean);

const allowedDevOrigins = [
  "localhost",
  "127.0.0.1",
  /* Common LAN fallbacks; your Mac’s IP may differ — see `next dev` “Network” line. */
  "192.168.1.139",
  "192.168.1.144",
  ...extraDevOrigins,
];

const nextConfig: NextConfig = {
  /**
   * Allow LAN device testing (iOS Safari on local IP) in dev.
   * Without this, Next can block dev resources for non-localhost origins.
   *
   * Simulator often uses `localhost` (same machine). A real device must open your Mac’s
   * LAN URL from `next dev` (“Network: http://…”). If that host is blocked, set
   * `FOLIO_ALLOWED_DEV_ORIGINS` in `.env.local` to your current IP (no `http://`, no port).
   */
  allowedDevOrigins: [...new Set(allowedDevOrigins)],
  images: {
    /* Replace same-named files in /public without long-lived stale `/_next/image` entries (esp. in dev). */
    minimumCacheTTL:
      process.env.NODE_ENV === "development" ? 0 : 60 * 60 * 24,
    /**
     * Next 16 defaults localPatterns to `{ pathname: "**", search: "" }`, which rejects any `?` in src.
     * Omitting `search` here allows `projectAssetSrc`’s `?v=` cache busting for `/public/images/**`.
     * `/_next/static/media/**` is still auto-appended for static image imports.
     */
    localPatterns: [{ pathname: "/images/**" }],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;

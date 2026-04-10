import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  },
};

export default nextConfig;

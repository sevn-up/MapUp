import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow Safari/Chrome on phones to load dev-server assets when hitting
  // the Mac's LAN IP (via `npm run dev:lan`). Without this, the HMR
  // WebSocket fails and dynamic chunks never load. Production unaffected.
  allowedDevOrigins: ["192.168.1.*", "192.168.0.*", "10.0.0.*"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;

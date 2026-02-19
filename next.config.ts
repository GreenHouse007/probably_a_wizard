import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // next-pwa uses webpack, so we need to opt out of Turbopack for builds
  turbopack: {},
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
    ],
  },
};

export default withPWA(nextConfig);

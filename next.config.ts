import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: [
    "playwright",
    "@crawlee/playwright",
    "@crawlee/core",
    "crawlee",
  ],
};

export default nextConfig;
